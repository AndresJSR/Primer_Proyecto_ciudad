// MainMenuLoader.js
// Lógica para cargar el menú de inicio en City Builder Game

export function loadMainMenu() {
  fetch('src/View/layouts/startMenu.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('app').innerHTML = html;
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'src/Business/Controllers/MainMenuController.js';
      document.body.appendChild(script);
      script.onload = () => {
        window.addEventListener('startGame', (e) => {
          window.__CITY_BUILDER_START_DATA__ = e.detail ?? null;
          document.getElementById('app').innerHTML = '';
          const appScript = document.createElement('script');
          appScript.type = 'module';
          appScript.src = 'src/App.js';
          document.body.appendChild(appScript);
        }, { once: true });
      };
    });
}

// Ejecutar automáticamente al cargar
window.addEventListener('DOMContentLoaded', loadMainMenu);