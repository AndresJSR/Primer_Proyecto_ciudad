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
  const fileInfoEl = document.getElementById('file-info');
  const mapNameBadge = document.getElementById('map-name-badge');
  const realCitySelect = document.getElementById('real-city-select');
  const realCityMeta = document.getElementById('real-city-meta');

  let selectedFile = null;
  let loadedMapData = null;
  let selectedRealCity = { ...FALLBACK_CITY };
  let availableCities = [];

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
  }

  function setupContinueButton() {
    if (!continueBtn) return;

    const snapshot = Persistence.loadCitySnapshot?.();
    if (!snapshot?.city) {
      continueBtn.hidden = true;
      continueBtn.disabled = true;
      return;
    }

    const cityName = snapshot.city.cityName ?? 'partida guardada';
    const turn = Number(snapshot.city.turn ?? 0);

    continueBtn.hidden = false;
    continueBtn.disabled = false;
    continueBtn.title = `Reanudar turno ${turn}`;
    continueBtn.querySelector('.btn-label').textContent = `Continuar ${cityName}`;
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

  async function preloadRealCities() {
    if (!realCitySelect) return;

    try {
      availableCities = await ApiColombiaService.getCities();

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
      realCitySelect.innerHTML = '<option value="">Bogotá - Bogotá D.C.</option>';
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
        setError(error.message);
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (!selectedFile || !loadedMapData || playBtn.disabled) return;

      window.dispatchEvent(new CustomEvent('startGame', {
        detail: {
          resumeSaved: false,
          fileName: selectedFile.name,
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