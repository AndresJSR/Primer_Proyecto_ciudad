// Controlador del menú de construcción City Builder
class ConstructionMenuController {
    constructor(menuSelector) {
        this.menu = document.querySelector(menuSelector);
        this.currentBuildMode = null;
        this._bindEvents();
        this._bindShortcuts();
    }

    _bindEvents() {
        // Acordeón de categorías
        this.menu.querySelectorAll('.category-toggle').forEach(btn => {
            btn.addEventListener('click', e => {
                const cat = btn.closest('.menu-category');
                const open = cat.classList.contains('open');
                this.menu.querySelectorAll('.menu-category').forEach(c => c.classList.remove('open'));
                this.menu.querySelectorAll('.category-toggle').forEach(b => b.setAttribute('aria-expanded', 'false'));
                if (!open) {
                    cat.classList.add('open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
        // Selección de opción
        this.menu.querySelectorAll('.build-option').forEach(btn => {
            btn.addEventListener('click', e => {
                if (btn.disabled || btn.classList.contains('disabled')) return;
                this.setBuildMode(btn.dataset.type);
                this._setActiveButton(btn);
            });
        });
        // Tooltip accesible
        this.menu.querySelectorAll('.build-option').forEach(btn => {
            btn.addEventListener('focus', e => btn.classList.add('active'));
            btn.addEventListener('blur', e => btn.classList.remove('active'));
        });
        // ESC para cancelar
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                this.cancelBuildMode();
            }
        });
    }

    _bindShortcuts() {
        document.addEventListener('keydown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'b' || e.key === 'B') {
                this.toggleMenu();
            }
            if (e.key === 'r' || e.key === 'R') {
                this.setBuildMode('road');
            }
            if (e.key === 'd' || e.key === 'D') {
                this.setBuildMode('demolish');
            }
        });
    }

    setBuildMode(type) {
        this.currentBuildMode = type;
        document.body.classList.add('build-mode');
        document.dispatchEvent(new CustomEvent('buildModeChanged', { detail: { type } }));
        this._setCursor(type);
    }

    cancelBuildMode() {
        this.currentBuildMode = null;
        document.body.classList.remove('build-mode');
        this.menu.querySelectorAll('.build-option').forEach(btn => btn.classList.remove('active'));
        document.dispatchEvent(new CustomEvent('buildModeChanged', { detail: { type: null } }));
        this._setCursor();
    }

    _setActiveButton(btn) {
        this.menu.querySelectorAll('.build-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    _setCursor(type) {
        if (type) {
            document.body.style.cursor = 'crosshair';
        } else {
            document.body.style.cursor = '';
        }
    }

    toggleMenu() {
        this.menu.classList.toggle('open-menu');
    }
}

// Inicialización automática al cargar el layout
window.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#construction-menu')) {
        window.constructionMenuController = new ConstructionMenuController('#construction-menu');
    }
});
