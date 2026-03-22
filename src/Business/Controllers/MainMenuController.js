import FileLoaderController from './FileLoaderController.js';
import Persistence from '../../../bussiness/controllers/PersistenceManager.js';
import ApiColombiaService from '../../../bussiness/services/ApiColombiaService.js';

(function () {
  'use strict';

  const DEFAULT_MAP_PATH = 'assets/maps/sample.txt';
  const FALLBACK_CITY = {
    name: 'Bogotá',
    departmentName: 'Bogotá D.C.',
    lat: 4.60971,
    lon: -74.08175,
  };

  const selectMapBtn = document.getElementById('select-map-btn');
  const mapFileInput = document.getElementById('map-file-input');
  const playBtn = document.getElementById('play-btn');
  const continueBtn = document.getElementById('continue-btn');
  const realCitySelect = document.getElementById('real-city-select');
  const realCityMeta = document.getElementById('real-city-meta');

  let fileInfoEl = document.getElementById('file-info');
  let mapNameBadge = document.getElementById('map-name-badge');

  let selectedFile = null;
  let loadedMapData = null;
  let selectedRealCity = { ...FALLBACK_CITY };
  let availableCities = [];

  function ensureOptionalNodes() {
    const menuInner = document.querySelector('#start-menu .menu-inner');

    if (!fileInfoEl && menuInner) {
      fileInfoEl = document.createElement('div');
      fileInfoEl.id = 'file-info';
      fileInfoEl.className = 'file-info';

      const locationBlock = document.querySelector('.location-block');
      if (locationBlock) {
        menuInner.insertBefore(fileInfoEl, locationBlock);
      } else {
        menuInner.appendChild(fileInfoEl);
      }
    }

    if (!mapNameBadge && playBtn) {
      mapNameBadge = document.createElement('span');
      mapNameBadge.id = 'map-name-badge';
      mapNameBadge.className = 'btn-badge';
      playBtn.appendChild(mapNameBadge);
    }
  }

  ensureOptionalNodes();

  console.log('MainMenu DOM refs:', {
    selectMapBtn: !!selectMapBtn,
    mapFileInput: !!mapFileInput,
    playBtn: !!playBtn,
    continueBtn: !!continueBtn,
    fileInfoEl: !!fileInfoEl,
    mapNameBadge: !!mapNameBadge,
    realCitySelect: !!realCitySelect,
    realCityMeta: !!realCityMeta,
  });

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
    const text = String(str ?? '');
    return text.length > max ? text.slice(0, max - 1) + '…' : text;
  }

  function normalizeSelectedRealCity(city) {
    if (!city) return { ...FALLBACK_CITY };

    return {
      name: city.name ?? FALLBACK_CITY.name,
      departmentName: city.departmentName ?? FALLBACK_CITY.departmentName,
      lat: Number.isFinite(Number(city.lat)) ? Number(city.lat) : FALLBACK_CITY.lat,
      lon: Number.isFinite(Number(city.lon)) ? Number(city.lon) : FALLBACK_CITY.lon,
    };
  }

  function renderSelectedCityMeta(city) {
    if (!realCityMeta) return;

    const hasCoords = Number.isFinite(city.lat) && Number.isFinite(city.lon);

    realCityMeta.textContent = hasCoords
      ? `${city.name}, ${city.departmentName} · ${city.lat.toFixed(4)}, ${city.lon.toFixed(4)}`
      : `${city.name}, ${city.departmentName} · sin coordenadas disponibles`;
  }

  function resetSelection() {
    selectedFile = null;
    loadedMapData = null;

    if (playBtn) {
      playBtn.disabled = true;
      playBtn.classList.remove('ready');
    }

    if (mapNameBadge) {
      mapNameBadge.textContent = '';
      mapNameBadge.classList.remove('visible');
    }
  }

  function setError(message) {
    ensureOptionalNodes();
    resetSelection();

    if (fileInfoEl) {
      fileInfoEl.innerHTML = `
        <span class="fi-icon">⚠</span>
        <span class="fi-name">${message}</span>
      `;
    }
  }

  function setSuccess(displayFile, mapData, sourceLabel = '') {
    ensureOptionalNodes();

    selectedFile = displayFile;
    loadedMapData = mapData;

    const sizekb = ((displayFile.size ?? 0) / 1024).toFixed(1);
    const name = truncate(displayFile.name ?? mapData.fileName ?? 'mapa.txt', 34);
    const { width, height, stats } = mapData.metadata;

    if (fileInfoEl) {
      fileInfoEl.innerHTML = `
        <span class="fi-icon">✦</span>
        <span class="fi-name">${name}</span>
        <span class="fi-size">${sizekb} KB</span>
        <span class="fi-size">${width}x${height}</span>
        <span class="fi-size">${stats.road} vías</span>
        <span class="fi-size">${stats.building} edificios</span>
        ${sourceLabel ? `<span class="fi-size">${sourceLabel}</span>` : ''}
      `;
    }

    if (playBtn) {
      playBtn.disabled = false;
      playBtn.classList.add('ready');
    }

    const shortName = (displayFile.name ?? mapData.fileName ?? 'mapa')
      .replace(/\.txt$/i, '');

    if (mapNameBadge) {
      mapNameBadge.textContent = truncate(shortName, 18);
      mapNameBadge.classList.add('visible');
    }
  }

  function setupContinueButton() {
    if (!continueBtn) return;

    const snapshot = Persistence.loadCitySnapshot?.();
    if (!snapshot?.city) {
      continueBtn.hidden = true;
      continueBtn.disabled = true;
      return;
    }

    const cityName = snapshot.city.cityName ?? snapshot.city.nombreCiudad ?? 'partida guardada';
    const turn = Number(snapshot.city.turn ?? snapshot.city.turnoActual ?? 0);

    continueBtn.hidden = false;
    continueBtn.disabled = false;
    continueBtn.title = `Reanudar turno ${turn}`;

    const continueLabel = continueBtn.querySelector('.btn-label');
    if (continueLabel) {
      continueLabel.textContent = `Continuar ${cityName}`;
    }
  }

  async function preloadProjectMap() {
    try {
      const mapData = await FileLoaderController.loadFromProject(DEFAULT_MAP_PATH);

      const projectFile = {
        name: mapData.fileName ?? 'sample.txt',
        size: mapData.fileSize ?? 0,
      };

      setSuccess(projectFile, mapData, 'mapa por defecto');
      console.log('Mapa por defecto cargado:', mapData);
    } catch (error) {
      console.error('Error cargando mapa por defecto:', error);
      setError(error.message ?? 'No se pudo cargar el mapa por defecto.');
    }
  }

  async function preloadRealCities() {
    if (!realCitySelect) return;

    try {
      availableCities = await ApiColombiaService.getCities();

      if (!Array.isArray(availableCities) || availableCities.length === 0) {
        throw new Error('No se encontraron ciudades.');
      }

      realCitySelect.innerHTML = availableCities.map((city, index) => `
        <option value="${index}">${city.name} - ${city.departmentName}</option>
      `).join('');

      const initialCity =
        availableCities.find((city) => Number.isFinite(city.lat) && Number.isFinite(city.lon)) ||
        availableCities[0] ||
        FALLBACK_CITY;

      selectedRealCity = normalizeSelectedRealCity(initialCity);

      const selectedIndex = availableCities.findIndex((city) => city.id === initialCity.id);
      realCitySelect.value = String(selectedIndex >= 0 ? selectedIndex : 0);
      renderSelectedCityMeta(selectedRealCity);

      realCitySelect.addEventListener('change', () => {
        const city = availableCities[Number(realCitySelect.value)] ?? FALLBACK_CITY;
        selectedRealCity = normalizeSelectedRealCity(city);
        renderSelectedCityMeta(selectedRealCity);
      });
    } catch (error) {
      console.error('No se pudieron cargar ciudades reales:', error);

      selectedRealCity = { ...FALLBACK_CITY };

      if (realCitySelect) {
        realCitySelect.innerHTML = '<option value="0">Bogotá - Bogotá D.C.</option>';
        realCitySelect.value = '0';
      }

      renderSelectedCityMeta(selectedRealCity);
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
        setError(error.message ?? 'No se pudo cargar el archivo.');
      } finally {
        mapFileInput.value = '';
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!selectedFile || !loadedMapData || playBtn.disabled) return;

      window.dispatchEvent(new CustomEvent('startGame', {
        detail: {
          resumeSaved: false,
          fileName: selectedFile.name ?? loadedMapData.fileName ?? 'mapa.txt',
          mapContent: loadedMapData.content,
          parsedMap: loadedMapData.parsed,
          mapMetadata: loadedMapData.metadata,
          serializableGrid: loadedMapData.serializableGrid,
          cityContext: selectedRealCity,
        },
      }));

      const menu = document.getElementById('start-menu');
      if (menu) {
        menu.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        menu.style.opacity = '0';
        menu.style.transform = 'scale(0.97) translateY(-12px)';
      }
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      if (continueBtn.disabled) return;

      window.dispatchEvent(new CustomEvent('startGame', {
        detail: {
          resumeSaved: true,
          cityContext: selectedRealCity,
        },
      }));
    });
  }

  spawnParticles();
  setupContinueButton();
  preloadProjectMap();
  preloadRealCities();
})();