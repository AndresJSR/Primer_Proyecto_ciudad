// Controlador de modales dinámicos City Builder
class ModalController {
    constructor(overlaySelector) {
        this.overlay = document.querySelector(overlaySelector);
        this.modal = this.overlay.querySelector('.modal');
        this.titleEl = this.overlay.querySelector('.modal-title');
        this.iconEl = this.overlay.querySelector('.modal-icon');
        this.descEl = this.overlay.querySelector('.modal-description');
        this.statsEl = this.overlay.querySelector('.modal-stats');
        this.actionsEl = this.overlay.querySelector('.modal-actions');
        this.closeBtn = this.overlay.querySelector('.modal-close');
        this._bindEvents();
        this.isOpen = false;
    }

    _bindEvents() {
        // Cerrar con botón
        this.closeBtn.addEventListener('click', () => this.close());
        // Cerrar con ESC
        document.addEventListener('keydown', e => {
            if (this.isOpen && e.key === 'Escape') this.close();
        });
        // Cerrar al hacer click fuera
        this.overlay.addEventListener('mousedown', e => {
            if (e.target === this.overlay) this.close();
        });
        // Acciones
        this.actionsEl.addEventListener('click', e => {
            if (e.target.classList.contains('modal-action-btn')) {
                const action = e.target.dataset.action;
                const id = e.target.dataset.id;
                if (!e.target.disabled && !e.target.classList.contains('disabled')) {
                    document.dispatchEvent(new CustomEvent('modalAction', { detail: { action, id } }));
                }
            }
        });
        // Animación de salida
        this.overlay.addEventListener('animationend', e => {
            if (e.animationName === 'modalFadeOut') {
                this.overlay.style.display = 'none';
                this.overlay.classList.remove('hide');
            }
        });
    }

    open(data) {
        this._render(data);
        this.overlay.style.display = 'flex';
        this.isOpen = true;
        setTimeout(() => this.modal.focus(), 10);
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.add('hide');
    }

    _render(data) {
        this.titleEl.textContent = data.title || '';
        this.descEl.textContent = data.description || '';
        // Icono o imagen (placeholder)
        this.iconEl.className = 'modal-icon placeholder';
        // Estadísticas
        this.statsEl.innerHTML = '';
        if (data.stats) {
            for (const key in data.stats) {
                const value = data.stats[key];
                const statDiv = document.createElement('div');
                statDiv.className = 'modal-stat' + (value <= 0 ? ' critical' : '');
                statDiv.innerHTML = `<span class="stat-label">${this._statLabel(key)}</span><span class="stat-value">${value}</span>`;
                this.statsEl.appendChild(statDiv);
            }
        }
        // Acciones
        this.actionsEl.innerHTML = '';
        if (Array.isArray(data.actions)) {
            data.actions.forEach(action => {
                const btn = document.createElement('button');
                btn.className = 'modal-action-btn';
                btn.textContent = this._actionLabel(action);
                btn.dataset.action = action;
                btn.dataset.id = data.id || '';
                if (data.disabledActions && data.disabledActions.includes(action)) {
                    btn.disabled = true;
                    btn.classList.add('disabled');
                }
                this.actionsEl.appendChild(btn);
            });
        }
    }

    _statLabel(key) {
        const map = {
            population: 'Población',
            electricity: 'Electricidad',
            water: 'Agua',
            maintenance: 'Mantenimiento',
            food: 'Alimentos',
            level: 'Nivel',
            happiness: 'Felicidad',
        };
        return map[key] || key;
    }

    _actionLabel(action) {
        const map = {
            upgrade: 'Mejorar',
            demolish: 'Demoler',
            disable: 'Desactivar',
            close: 'Cerrar',
        };
        return map[action] || action;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#modal-overlay')) {
        window.modalController = new ModalController('#modal-overlay');
        // Escuchar evento openModal
        document.addEventListener('openModal', e => {
            window.modalController.open(e.detail);
        });
    }
});
