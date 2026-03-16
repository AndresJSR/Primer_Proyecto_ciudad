// Controlador del Panel de Recursos City Builder
class ResourcePanelController {
    constructor(panelSelector) {
        this.panel = document.querySelector(panelSelector);
        this.moneyEl = this.panel.querySelector('#money-value');
        this.electricityEl = this.panel.querySelector('#electricity-value');
        this.waterEl = this.panel.querySelector('#water-value');
        this.foodEl = this.panel.querySelector('#food-value');
        this.populationEl = this.panel.querySelector('#population-value');
        this.happinessEl = this.panel.querySelector('#happiness-value');
        this._bindTooltips();
        this._listen();
    }

    _listen() {
        document.addEventListener('resourcesUpdated', e => {
            this.render(e.detail);
        });
    }

    render(data) {
        this._updateMoney(data.money);
        this._updateElectricity(data.electricity);
        this._updateWater(data.water);
        this._updateFood(data.food);
        this._updatePopulation(data.population);
        this._updateHappiness(data.happiness);
    }

    _updateMoney(money) {
        this.moneyEl.textContent = `$${money.toLocaleString()}`;
        this.moneyEl.parentElement.classList.remove('low', 'critical');
        if (money < 1000) {
            this.moneyEl.parentElement.classList.add('critical');
        } else if (money < 5000) {
            this.moneyEl.parentElement.classList.add('low');
        }
        this._animateValue(this.moneyEl);
    }

    _updateElectricity(e) {
        this.electricityEl.textContent = `${e.production} / ${e.consumption}`;
        let tooltip = `Producción: ${e.production}\nConsumo: ${e.consumption}\nBalance: ${e.production - e.consumption}`;
        this.electricityEl.parentElement.classList.toggle('critical', e.production - e.consumption < 0);
        this.electricityEl.parentElement.querySelector('.icon').title = tooltip;
        this._setTooltip(this.electricityEl, tooltip);
        this._animateValue(this.electricityEl);
    }

    _updateWater(w) {
        this.waterEl.textContent = `${w.production} / ${w.consumption}`;
        let tooltip = `Producción: ${w.production}\nConsumo: ${w.consumption}\nBalance: ${w.production - w.consumption}`;
        this.waterEl.parentElement.classList.toggle('critical', w.production - w.consumption < 0);
        this.waterEl.parentElement.querySelector('.icon').title = tooltip;
        this._setTooltip(this.waterEl, tooltip);
        this._animateValue(this.waterEl);
    }

    _updateFood(food) {
        this.foodEl.textContent = `${food}`;
        let tooltip = `Alimentos disponibles: ${food}`;
        this.foodEl.parentElement.classList.toggle('critical', food <= 0);
        this._setTooltip(this.foodEl, tooltip);
        this._animateValue(this.foodEl);
    }

    _updatePopulation(pop) {
        this.populationEl.textContent = `${pop}`;
        let tooltip = `Población total: ${pop}`;
        this._setTooltip(this.populationEl, tooltip);
        this._animateValue(this.populationEl);
    }

    _updateHappiness(h) {
        this.happinessEl.textContent = `${h}%`;
        let tooltip = `Felicidad promedio: ${h}%`;
        this._setTooltip(this.happinessEl, tooltip);
        this._animateValue(this.happinessEl);
    }

    _setTooltip(el, text) {
        let tooltip = el.parentElement.querySelector('.tooltip');
        if (!tooltip) {
            tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            el.parentElement.appendChild(tooltip);
        }
        tooltip.textContent = text;
    }

    _bindTooltips() {
        this.panel.querySelectorAll('.resource').forEach(res => {
            res.addEventListener('mouseenter', () => {
                const tooltip = res.querySelector('.tooltip');
                if (tooltip) tooltip.style.display = 'block';
            });
            res.addEventListener('mouseleave', () => {
                const tooltip = res.querySelector('.tooltip');
                if (tooltip) tooltip.style.display = '';
            });
        });
    }

    _animateValue(el) {
        el.classList.remove('animated');
        void el.offsetWidth; // trigger reflow
        el.classList.add('animated');
        setTimeout(() => el.classList.remove('animated'), 500);
    }
}

function initResourcePanelController() {
    if (document.querySelector('#resource-panel') && !window.resourcePanelController) {
        window.resourcePanelController = new ResourcePanelController('#resource-panel');
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initResourcePanelController, { once: true });
} else {
    initResourcePanelController();
}