import FileLoaderController from './FileLoaderController.js';

(function () {
  'use strict';

  const DEFAULT_MAP_PATH = 'assets/maps/sample.txt';

  const selectMapBtn = document.getElementById('select-map-btn');
  const mapFileInput = document.getElementById('map-file-input');
  const playBtn = document.getElementById('play-btn');
  const fileInfoEl = document.getElementById('file-info');
  const mapNameBadge = document.getElementById('map-name-badge');

  let selectedFile = null;
  let loadedMapData = null;

  function spawnParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const count = 28;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const x = Math.random() * 100;
      const y = 30 + Math.random() * 60;
      const dur = 5 + Math.random() * 7;
      const delay = Math.random() * 8;
      const size = Math.random() > 0.7 ? 3 : 2;

      p.style.cssText = `
        left: ${x}%;
        top: ${y}%;
        --dur: ${dur}s;
        --delay: ${delay}s;
        width: ${size}px;
        height: ${size}px;
        opacity: 0;
      `;

      container.appendChild(p);
    }
  }

  function truncate(str, max) {
    return str.length > max ? str.slice(0, max - 1) + '…' : str;
  }

  function resetSelection() {
    selectedFile = null;
    loadedMapData = null;
    playBtn.disabled = true;
    playBtn.classList.remove('ready');
    mapNameBadge.textContent = '';
    mapNameBadge.classList.remove('visible');
  }

  function setError(message) {
    resetSelection();
    fileInfoEl.innerHTML = `
      <span class="fi-icon">⚠</span>
      <span class="fi-name">${message}</span>
    `;
  }

  function setSuccess(displayFile, mapData, sourceLabel = '') {
    selectedFile = displayFile;
    loadedMapData = mapData;

    const sizekb = ((displayFile.size ?? 0) / 1024).toFixed(1);
    const name = truncate(displayFile.name ?? mapData.fileName ?? 'mapa.txt', 34);
    const { width, height, stats } = mapData.metadata;

    fileInfoEl.innerHTML = `
      <span class="fi-icon">✦</span>
      <span class="fi-name">${name}</span>
      <span class="fi-size">${sizekb} KB</span>
      <span class="fi-size">${width}x${height}</span>
      <span class="fi-size">${stats.road} vías</span>
      <span class="fi-size">${stats.building} edificios</span>
      ${sourceLabel ? `<span class="fi-size">${sourceLabel}</span>` : ''}
    `;

    playBtn.disabled = false;
    playBtn.classList.add('ready');

    const shortName = (displayFile.name ?? mapData.fileName ?? 'mapa')
      .replace(/\.txt$/i, '');

    mapNameBadge.textContent = truncate(shortName, 18);
    mapNameBadge.classList.add('visible');

    playBtn.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.03)' },
        { transform: 'scale(1)' },
      ],
      { duration: 350, easing: 'ease-in-out' }
    );
  }

  async function preloadProjectMap() {
    try {
      const mapData = await FileLoaderController.loadFromProject(DEFAULT_MAP_PATH);

      const projectFile = {
        name: mapData.fileName,
        size: mapData.fileSize ?? 0,
      };

      setSuccess(projectFile, mapData, 'mapa por defecto');
      console.log('Mapa por defecto cargado:', mapData);
    } catch (error) {
      console.error('Error cargando mapa por defecto:', error);
      setError(error.message);
    }
  }

  if (selectMapBtn && mapFileInput) {
    selectMapBtn.addEventListener('click', () => {
      mapFileInput.click();
    });

    mapFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const mapData = await FileLoaderController.loadFromFile(file);
        setSuccess(file, mapData, 'archivo seleccionado');
        console.log('Mapa cargado desde archivo:', mapData);
      } catch (error) {
        console.error('Error cargando archivo:', error);
        setError(error.message);
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!selectedFile || !loadedMapData || playBtn.disabled) return;

      window.dispatchEvent(new CustomEvent('startGame', {
        detail: {
          fileName: selectedFile.name,
          mapContent: loadedMapData.content,
          parsedMap: loadedMapData.parsed,
          mapMetadata: loadedMapData.metadata,
          serializableGrid: loadedMapData.serializableGrid,
        }
      }));

      const menu = document.getElementById('start-menu');
      if (menu) {
        menu.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        menu.style.opacity = '0';
        menu.style.transform = 'scale(0.97) translateY(-12px)';
      }
    });
  }

  spawnParticles();
  preloadProjectMap();
})();