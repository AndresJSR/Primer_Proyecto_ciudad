function removeScriptById(id) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
}

function appendModuleScript({ id, src }) {
  return new Promise((resolve, reject) => {
    removeScriptById(id);

    const script = document.createElement('script');
    script.type = 'module';
    script.id = id;
    script.src = src;
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`No se pudo cargar el script ${src}`));
    document.body.appendChild(script);
  });
}

function startGameFromMenu(detail) {
  window.__CITY_BUILDER_START_DATA__ = detail ?? null;

  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = '';
  }

  appendModuleScript({
    id: 'city-builder-app-script',
    src: 'src/App.js',
  }).catch((error) => {
    console.error(error);
  });
}

function handleStartGame(event) {
  startGameFromMenu(event.detail);
}

export async function loadMainMenu() {
  try {
    const response = await fetch('src/View/layouts/startMenu.html');

    if (!response.ok) {
      throw new Error('No se pudo cargar el menú de inicio.');
    }

    const html = await response.text();

    const app = document.getElementById('app');
    if (!app) {
      throw new Error('No existe el contenedor #app.');
    }

    app.innerHTML = html;

    window.removeEventListener('startGame', handleStartGame);
    window.addEventListener('startGame', handleStartGame, { once: true });

    await appendModuleScript({
      id: 'city-builder-main-menu-script',
      src: 'src/Business/Controllers/MainMenuController.js',
    });
  } catch (error) {
    console.error('Error inicializando el menú principal:', error);

    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="menu-load-error">
        <h1>No se pudo cargar el menú principal</h1>
        <p>${error.message}</p>
      </div>
    `;
  }
}

window.addEventListener('DOMContentLoaded', loadMainMenu, { once: true });