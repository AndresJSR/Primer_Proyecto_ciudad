import FileLoaderController from './Business/Controllers/FileLoaderController.js';
import Game from '../bussiness/core/Game.js';
import Config from '../bussiness/core/Config.js';
import Persistence from '../bussiness/controllers/PersistenceManager.js';
import CityMap from '../models/Map.js';
import BuildingFactory from '../utils/BuildingFactory.js';
import ExternalDataController from './Business/Controllers/ExternalDataController.js';
import RoutingService from '../bussiness/services/RoutingService.js';

const script = document.createElement('script');
script.src = 'src/Business/Controllers/ConstructionMenuController.js';
document.head.appendChild(script);

const resourcePanelScript = document.createElement('script');
resourcePanelScript.src = 'src/Business/Controllers/ResourcePanelController.js';
document.head.appendChild(resourcePanelScript);

const modalScript = document.createElement('script');
modalScript.src = 'src/Business/Controllers/ModalController.js';
document.head.appendChild(modalScript);

window.addEventListener('buildModeChanged', (e) => {
  console.log('Modo de construcción:', e.detail.type);
});

const startData = window.__CITY_BUILDER_START_DATA__ ?? null;
const DEFAULT_CITY_CONTEXT = normalizeCityContext(startData?.cityContext ?? null);
const DEFAULT_CITY_META = {
  nombreCiudad: DEFAULT_CITY_CONTEXT.name,
  nombreAlcalde: 'Alcalde Virtual',
  regionNombre: DEFAULT_CITY_CONTEXT.departmentName,
  latitud: DEFAULT_CITY_CONTEXT.lat,
  longitud: DEFAULT_CITY_CONTEXT.lon,
  recursosIniciales: {
    money: 50000,
    electricity: 0,
    water: 0,
    food: 0,
  },
};

const BUILD_MODE_TO_CODE = {
  house: 'R1',
  apartment: 'R2',
  store: 'C1',
  mall: 'C2',
  factory: 'I1',
  farm: 'I2',
  police: 'S1',
  fire: 'S2',
  hospital: 'S3',
  powerplant: 'U1',
  waterplant: 'U2',
  park: 'P1',
};

let currentMapData = null;
let currentGame = null;
let autosaveTimerId = null;
let lastLoadedSnapshot = null;
let externalDataController = null;
let routeSelection = {
  active: false,
  origin: null,
  destination: null,
  path: [],
};

try {
  if (startData?.parsedMap?.cells) {
    currentMapData = startData.parsedMap;
  } else if (startData?.mapContent) {
    currentMapData = FileLoaderController.loadFromText(startData.mapContent, {
      fileName: startData.fileName ?? 'mapa.txt',
    }).parsed;
  }
} catch (error) {
  console.error('No se pudo restaurar el mapa inicial:', error);
}

if (!currentMapData) {
  currentMapData = buildDefaultMap(15, 15);
}

const tileWidth = 80;
const tileHeight = 40;

function normalizeCityContext(cityContext) {
  return {
    name: cityContext?.name ?? 'Bogotá',
    departmentName: cityContext?.departmentName ?? 'Bogotá D.C.',
    lat: Number.isFinite(Number(cityContext?.lat)) ? Number(cityContext.lat) : 4.60971,
    lon: Number.isFinite(Number(cityContext?.lon)) ? Number(cityContext.lon) : -74.08175,
  };
}

function getMapSize() {
  const width = (currentMapData.width + currentMapData.height) * (tileWidth / 2);
  const height = (currentMapData.width + currentMapData.height) * (tileHeight / 2);
  return { width, height };
}

let camera = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  minScale: 0.35,
  maxScale: 3.0,
};

let anim = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
  running: false,
};

let isDragging = false;
let lastMouse = { x: 0, y: 0 };

function applyTransform(ox, oy, sc) {
  const cameraEl = document.querySelector('.map-camera');
  if (!cameraEl) return;
  cameraEl.style.transform = `translate(-50%, -50%) translate(${ox}px, ${oy}px) scale(${sc})`;
}

function startAnimLoop() {
  if (anim.running) return;
  anim.running = true;

  function tick() {
    const LERP = 0.14;

    const dX = camera.offsetX - anim.offsetX;
    const dY = camera.offsetY - anim.offsetY;
    const dS = camera.scale - anim.scale;

    anim.offsetX += dX * LERP;
    anim.offsetY += dY * LERP;
    anim.scale += dS * LERP;

    applyTransform(anim.offsetX, anim.offsetY, anim.scale);

    const done =
      Math.abs(dX) < 0.05 &&
      Math.abs(dY) < 0.05 &&
      Math.abs(dS) < 0.0005;

    if (done) {
      anim.offsetX = camera.offsetX;
      anim.offsetY = camera.offsetY;
      anim.scale = camera.scale;
      applyTransform(anim.offsetX, anim.offsetY, anim.scale);
      anim.running = false;
    } else {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function clampOffset() {
  const viewport = document.querySelector('.map-viewport');
  if (!viewport) return;

  const { width: mapW, height: mapH } = getMapSize();
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;

  const sw = mapW * camera.scale;
  const sh = mapH * camera.scale;

  const maxX = Math.max(0, (sw - vw) / 2 + vw * 0.25);
  const maxY = Math.max(0, (sh - vh) / 2 + vh * 0.25);

  camera.offsetX = Math.max(-maxX, Math.min(maxX, camera.offsetX));
  camera.offsetY = Math.max(-maxY, Math.min(maxY, camera.offsetY));
}

function centerCamera() {
  const viewport = document.querySelector('.map-viewport');
  let initialScale = 1;

  if (viewport) {
    const { width: mapW, height: mapH } = getMapSize();
    const scaleX = (viewport.clientWidth * 0.85) / mapW;
    const scaleY = (viewport.clientHeight * 0.85) / mapH;
    initialScale = Math.min(scaleX, scaleY, 1.0);
    initialScale = Math.max(camera.minScale, initialScale);
  }

  camera.offsetX = 0;
  camera.offsetY = 0;
  camera.scale = initialScale;
  anim.offsetX = 0;
  anim.offsetY = 0;
  anim.scale = initialScale;
  applyTransform(0, 0, initialScale);
}

function setupCameraControls() {
  const viewport = document.querySelector('.map-viewport');
  if (!viewport) return;

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.10 : 1 / 1.10;
    const prevScale = camera.scale;
    const newScale = Math.max(camera.minScale, Math.min(camera.maxScale, prevScale * zoomFactor));

    if (newScale === prevScale) return;

    const rect = viewport.getBoundingClientRect();
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;

    camera.offsetX = cursorX - (cursorX - camera.offsetX) * (newScale / prevScale);
    camera.offsetY = cursorY - (cursorY - camera.offsetY) * (newScale / prevScale);
    camera.scale = newScale;

    clampOffset();
    startAnimLoop();
  }, { passive: false });

  viewport.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    lastMouse = { x: e.clientX, y: e.clientY };
    viewport.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    camera.offsetX += e.clientX - lastMouse.x;
    camera.offsetY += e.clientY - lastMouse.y;
    lastMouse = { x: e.clientX, y: e.clientY };
    clampOffset();
    startAnimLoop();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    viewport.style.cursor = '';
  });

  let lastTouch = null;
  let lastPinchDist = null;

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      lastPinchDist = null;
    } else if (e.touches.length === 2) {
      lastPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && lastTouch) {
      camera.offsetX += e.touches[0].clientX - lastTouch.x;
      camera.offsetY += e.touches[0].clientY - lastTouch.y;
      lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      clampOffset();
      startAnimLoop();
    } else if (e.touches.length === 2 && lastPinchDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const ratio = dist / lastPinchDist;
      const prevScale = camera.scale;
      camera.scale = Math.max(camera.minScale, Math.min(camera.maxScale, prevScale * ratio));

      const rect = viewport.getBoundingClientRect();
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - rect.width / 2;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top - rect.height / 2;
      camera.offsetX = cx - (cx - camera.offsetX) * (camera.scale / prevScale);
      camera.offsetY = cy - (cy - camera.offsetY) * (camera.scale / prevScale);

      lastPinchDist = dist;
      clampOffset();
      startAnimLoop();
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => {
    lastTouch = null;
    lastPinchDist = null;
  }, { passive: true });

  viewport.addEventListener('dblclick', () => {
    camera.offsetX = 0;
    camera.offsetY = 0;
    clampOffset();
    startAnimLoop();
  });
}

function renderGrid() {
  const map = document.getElementById('city-map');
  if (!map) return;

  map.innerHTML = '';

  const mapWidth = (currentMapData.width + currentMapData.height) * (tileWidth / 2);
  const mapHeight = (currentMapData.width + currentMapData.height) * (tileHeight / 2);

  map.style.width = `${mapWidth}px`;
  map.style.height = `${mapHeight}px`;

  const centerX = mapWidth / 2;

  currentMapData.cells.forEach((row, y) => {
    row.forEach((cellData, x) => {
      const cell = document.createElement('div');
      cell.className = `city-cell terrain-${cellData.type}`;
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.dataset.token = cellData.token;

      if (cellData.category) {
        cell.dataset.category = cellData.category;
        cell.classList.add(`building-${cellData.category}`);
      }

      const isoX = (x - y) * (tileWidth / 2);
      const isoY = (x + y) * (tileHeight / 2);

      cell.style.left = `${isoX + centerX - tileWidth / 2}px`;
      cell.style.top = `${isoY}px`;

      if (cellData.type === 'building' && cellData.code) {
        const label = document.createElement('span');
        label.className = 'building-label';
        label.textContent = cellData.code;
        cell.appendChild(label);
      }

      map.appendChild(cell);
    });
  });

  console.log('Mapa cargado:', {
    fileName: startData?.fileName ?? 'mapa por defecto',
    width: currentMapData.width,
    height: currentMapData.height,
    stats: currentMapData.stats,
  });

  renderRoutePath();
}

function setRouteStatus(message) {
  const statusEl = document.getElementById('route-status');
  if (statusEl) {
    statusEl.textContent = message;
  }
}

function clearRouteSelection({ keepMode = false } = {}) {
  routeSelection = {
    active: keepMode ? routeSelection.active : false,
    origin: null,
    destination: null,
    path: [],
  };

  const routeBtn = document.getElementById('route-mode-btn');
  if (routeBtn) {
    routeBtn.classList.toggle('active', Boolean(routeSelection.active));
  }
}

function renderRoutePath() {
  const mapEl = document.getElementById('city-map');
  if (!mapEl) return;

  mapEl.querySelectorAll('.city-cell').forEach((cellEl) => {
    cellEl.classList.remove('route-origin', 'route-destination', 'route-path');
  });

  for (const point of routeSelection.path ?? []) {
    const selector = `.city-cell[data-x="${point.x}"][data-y="${point.y}"]`;
    const cellEl = mapEl.querySelector(selector);
    if (cellEl) {
      cellEl.classList.add('route-path');
    }
  }

  if (routeSelection.origin) {
    const selector = `.city-cell[data-x="${routeSelection.origin.x}"][data-y="${routeSelection.origin.y}"]`;
    const cellEl = mapEl.querySelector(selector);
    if (cellEl) {
      cellEl.classList.add('route-origin');
    }
  }

  if (routeSelection.destination) {
    const selector = `.city-cell[data-x="${routeSelection.destination.x}"][data-y="${routeSelection.destination.y}"]`;
    const cellEl = mapEl.querySelector(selector);
    if (cellEl) {
      cellEl.classList.add('route-destination');
    }
  }
}

function buildRoadMatrix(city) {
  return Array.from({ length: city.alto }, (_, y) =>
    Array.from({ length: city.ancho }, (_, x) =>
      city.mapa.getCell(x, y).isRoad() ? 1 : 0,
    ),
  );
}

async function calculateRouteAndRender() {
  if (!currentGame || !routeSelection.origin || !routeSelection.destination) return;

  const city = currentGame.getCity();
  const mapMatrix = buildRoadMatrix(city);

  setRouteStatus('Calculando ruta...');

  try {
    const response = await RoutingService.calculateRoute({
      map: mapMatrix,
      origin: routeSelection.origin,
      destination: routeSelection.destination,
    });

    const route = Array.isArray(response?.route)
      ? response.route
      : Array.isArray(response)
        ? response
        : [];

    if (!route.length) {
      routeSelection.path = [];
      renderRoutePath();
      setRouteStatus('No hay ruta disponible entre estos edificios.');
      return;
    }

    routeSelection.path = route;
    renderRoutePath();
    setRouteStatus(`Ruta calculada (${route.length} celdas).`);
  } catch (error) {
    console.error('Error calculando ruta:', error);
    routeSelection.path = [];
    renderRoutePath();
    setRouteStatus('No se pudo calcular la ruta.');
  }
}

function setupRouteControls() {
  const routeBtn = document.getElementById('route-mode-btn');
  const clearBtn = document.getElementById('clear-route-btn');

  if (!routeBtn || !clearBtn) return;

  routeBtn.addEventListener('click', () => {
    const nextActive = !routeSelection.active;
    clearRouteSelection({ keepMode: true });
    routeSelection.active = nextActive;
    routeBtn.classList.toggle('active', nextActive);

    if (nextActive) {
      window.constructionMenuController?.cancelBuildMode?.();
      setRouteStatus('Selecciona edificio de origen.');
    } else {
      setRouteStatus('Modo ruta desactivado.');
    }
  });

  clearBtn.addEventListener('click', () => {
    clearRouteSelection({ keepMode: true });
    renderRoutePath();
    setRouteStatus(routeSelection.active
      ? 'Ruta limpiada. Selecciona edificio de origen.'
      : 'Ruta limpiada.');
  });
}

function buildDefaultMap(width, height) {
  const cells = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      raw: 'g',
      token: 'g',
      valid: true,
      type: 'grass',
      code: null,
      category: null,
    })),
  );

  return {
    valid: true,
    errors: [],
    warnings: [],
    width,
    height,
    rows: Array.from({ length: height }, () => Array.from({ length: width }, () => 'g')),
    cells,
    stats: {
      total: width * height,
      grass: width * height,
      road: 0,
      building: 0,
      buildingsByCode: {},
    },
  };
}

function initializeGameSession() {
  const shouldResumeSaved = Boolean(startData?.resumeSaved);

  if (shouldResumeSaved && Persistence.hasSavedCity?.()) {
    const restoredGame = createGameFromSavedCity();
    if (restoredGame) {
      currentGame = restoredGame;
      currentMapData = buildRenderableMapFromCity(currentGame.getCity());
      return;
    }
  }

  currentGame = createNewGameFromParsedMap(currentMapData);

  if (startData?.serializableGrid || startData?.mapContent || startData?.fileName) {
    Persistence.saveMapDefinition?.({
      fileName: startData?.fileName ?? 'mapa.txt',
      width: currentMapData.width,
      height: currentMapData.height,
      stats: currentMapData.stats,
      grid: startData?.serializableGrid ?? currentMapData.cells,
      content: startData?.mapContent ?? null,
    });
  }
}

function createNewGameFromParsedMap(parsedMap) {
  const config = new Config();
  const game = new Game({
    config,
    onTick: handleGameTick,
  });

  game.createNewCity({
    ...DEFAULT_CITY_META,
    ancho: parsedMap.width,
    alto: parsedMap.height,
  });

  const city = game.getCity();
  applyParsedMapToCity(city, parsedMap);

  if (!Array.isArray(city.resourceHistory)) {
    city.resourceHistory = [];
  }

  city.resourceHistory.push({
    turn: 0,
    reason: 'new-game',
    timestamp: new Date().toISOString(),
    resources: city.recursos.toJSON(),
    population: city.getPoblacionTotal(),
    happiness: city.felicidadPromedio,
    score: city.puntuacionAcumulada,
    production: null,
    consumption: null,
  });

  return game;
}

function createGameFromSavedCity() {
  const snapshot = Persistence.loadCitySnapshot?.();
  const city = Persistence.loadCity?.();

  if (!snapshot || !city) return null;

  const config = new Config(snapshot.config ?? {});
  const game = new Game({
    config,
    onTick: handleGameTick,
  });

  game.createNewCity({
    nombreCiudad: city.nombreCiudad,
    nombreAlcalde: city.nombreAlcalde,
    regionNombre: city.regionNombre ?? '',
    latitud: city.latitud,
    longitud: city.longitud,
    ancho: city.ancho,
    alto: city.alto,
    recursosIniciales: city.recursos?.toJSON ? city.recursos.toJSON() : city.recursos,
  });

  game.gameState.city = city;
  game.buildingManager.city = city;
  game.resourceManager.city = city;
  game.citizenManager.city = city;
  game.scoreManager.city = city;
  game.turnSystem.gameState = game.gameState;

  if (snapshot.gameState) {
    game.gameState.status = snapshot.gameState.status ?? 'stopped';
    game.gameState.createdAt = snapshot.gameState.createdAt ?? game.gameState.createdAt;
    game.gameState.lastTickAt = snapshot.gameState.lastTickAt ?? game.gameState.lastTickAt;
  }

  lastLoadedSnapshot = snapshot;
  return game;
}

function applyParsedMapToCity(city, parsedMap) {
  city.mapa = new CityMap(parsedMap.width, parsedMap.height);
  city.edificios = [];

  for (const row of parsedMap.cells) {
    for (const cell of row) {
      if (cell.type === 'road') {
        city.mapa.placeRoad(cell.x, cell.y);
      } else if (cell.type === 'building' && cell.code) {
        const building = BuildingFactory.fromJSON({
          id: crypto.randomUUID(),
          code: cell.code,
          x: cell.x,
          y: cell.y,
        });

        city.agregarEdificio(building);
        city.mapa.placeBuilding(cell.x, cell.y, building.id);
      }
    }
  }
}

function buildRenderableMapFromCity(city) {
  const buildingsById = new globalThis.Map(city.edificios.map((building) => [building.id, building]));
  const cells = [];

  for (let y = 0; y < city.alto; y++) {
    const row = [];

    for (let x = 0; x < city.ancho; x++) {
      const modelCell = city.mapa.getCell(x, y);

      const cellData = {
        x,
        y,
        raw: 'g',
        token: 'g',
        valid: true,
        type: 'grass',
        code: null,
        category: null,
      };

      if (modelCell.isRoad()) {
        cellData.raw = 'r';
        cellData.token = 'r';
        cellData.type = 'road';
      } else if (modelCell.isBuilding()) {
        const building = buildingsById.get(modelCell.buildingId);
        cellData.raw = building?.code ?? 'B';
        cellData.token = building?.code ?? 'B';
        cellData.type = 'building';
        cellData.code = building?.code ?? null;
        cellData.category = building?.category ?? null;
      }

      row.push(cellData);
    }

    cells.push(row);
  }

  return {
    valid: true,
    errors: [],
    warnings: [],
    width: city.ancho,
    height: city.alto,
    rows: cells.map((row) => row.map((cell) => cell.token)),
    cells,
    stats: {
      total: city.ancho * city.alto,
      grass: cells.flat().filter((c) => c.type === 'grass').length,
      road: cells.flat().filter((c) => c.type === 'road').length,
      building: cells.flat().filter((c) => c.type === 'building').length,
      buildingsByCode: cells.flat().reduce((acc, c) => {
        if (c.code) acc[c.code] = (acc[c.code] ?? 0) + 1;
        return acc;
      }, {}),
    },
  };
}

function buildResourcePayload() {
  if (!currentGame) {
    return {
      money: 0,
      electricity: { production: 0, consumption: 0 },
      water: { production: 0, consumption: 0 },
      food: 0,
      population: 0,
      happiness: 0,
    };
  }

  const city = currentGame.getCity();
  const config = currentGame.config;

  const production = { electricity: 0, water: 0 };
  const consumption = { electricity: 0, water: 0 };

  for (const building of city.edificios) {
    production.electricity += Number(building.production?.electricity ?? 0);
    production.water += Number(building.production?.water ?? 0);
    consumption.electricity += Number(building.consumption?.electricity ?? 0);
    consumption.water += Number(building.consumption?.water ?? 0);
  }

  const population = city.getPoblacionTotal();
  consumption.electricity += population * Number(config.citizenConsumption?.electricity ?? 0);
  consumption.water += population * Number(config.citizenConsumption?.water ?? 0);

  return {
    money: Number(city.recursos.money ?? 0),
    electricity: {
      production: production.electricity,
      consumption: consumption.electricity,
    },
    water: {
      production: production.water,
      consumption: consumption.water,
    },
    food: Number(city.recursos.food ?? 0),
    population,
    happiness: Number(city.felicidadPromedio ?? 0),
  };
}

function renderResourcePanel() {
  document.dispatchEvent(new CustomEvent('resourcesUpdated', {
    detail: buildResourcePayload(),
  }));
}

function recordResourceSnapshot({ reason, payload = null } = {}) {
  if (!currentGame) return;

  const city = currentGame.getCity();

  if (!Array.isArray(city.resourceHistory)) {
    city.resourceHistory = [];
  }

  city.resourceHistory.push({
    turn: city.turnoActual,
    reason,
    timestamp: new Date().toISOString(),
    resources: city.recursos.toJSON(),
    population: city.getPoblacionTotal(),
    happiness: city.felicidadPromedio,
    score: city.puntuacionAcumulada,
    production: payload?.resourcesReport?.totalProduction ?? null,
    consumption: payload?.resourcesReport?.totalConsumption ?? null,
  });

  if (city.resourceHistory.length > 20) {
    city.resourceHistory = city.resourceHistory.slice(-20);
  }
}

function saveNow(reason = 'manual') {
  if (!currentGame) return null;

  return Persistence.saveCity?.(currentGame.getCity(), {
    config: currentGame.config,
    gameState: currentGame.getState(),
    mapDefinition: Persistence.loadMapDefinition?.(),
    metadata: {
      reason,
      loadedFromSave: Boolean(lastLoadedSnapshot),
    },
  });
}

function startAutosave() {
  stopAutosave();

  if (!currentGame) return;

  const autosaveMs = Number(currentGame.config?.autosaveMs ?? 30000);
  autosaveTimerId = window.setInterval(() => {
    saveNow('autosave');
  }, autosaveMs);
}

function stopAutosave() {
  if (autosaveTimerId !== null) {
    clearInterval(autosaveTimerId);
    autosaveTimerId = null;
  }
}

function handleGameTick(payload) {
  if (payload?.scoreReport?.rankingEntry) {
    Persistence.upsertRankingEntry?.(payload.scoreReport.rankingEntry);
  }

  recordResourceSnapshot({
    reason: payload.city.gameOver ? 'game-over' : 'turn',
    payload,
  });

  currentMapData = buildRenderableMapFromCity(payload.city);
  renderGrid();
  renderResourcePanel();
  saveNow('tick');
}

function setupMapInteractions() {
  const mapEl = document.getElementById('city-map');
  if (!mapEl) return;

  mapEl.addEventListener('click', async (event) => {
    const cellEl = event.target.closest('.city-cell');
    if (!cellEl || !currentGame) return;

    const x = Number(cellEl.dataset.x);
    const y = Number(cellEl.dataset.y);

    if (routeSelection.active) {
      const modelCell = currentGame.getCity().mapa.getCell(x, y);
      if (!modelCell.isBuilding()) {
        setRouteStatus('Debes seleccionar un edificio como origen/destino.');
        return;
      }

      if (!routeSelection.origin) {
        routeSelection.origin = { x, y };
        routeSelection.destination = null;
        routeSelection.path = [];
        renderRoutePath();
        setRouteStatus('Origen seleccionado. Ahora selecciona edificio destino.');
        return;
      }

      if (routeSelection.origin.x === x && routeSelection.origin.y === y) {
        setRouteStatus('El destino debe ser diferente al origen.');
        return;
      }

      routeSelection.destination = { x, y };
      await calculateRouteAndRender();
      return;
    }

    const buildMode = window.constructionMenuController?.currentBuildMode ?? null;

    if (!buildMode) return;

    let result = null;

    if (buildMode === 'road') {
      result = currentGame.buildRoad(x, y);
    } else if (buildMode === 'demolish') {
      result = currentGame.demolish(x, y);
    } else {
      const code = BUILD_MODE_TO_CODE[buildMode];
      if (!code) {
        console.warn(`No existe código para el modo '${buildMode}'.`);
        return;
      }
      result = currentGame.buildBuilding(code, x, y);
    }

    if (!result?.ok) {
      console.warn(result?.message ?? 'No se pudo realizar la acción.');
      return;
    }

    currentMapData = buildRenderableMapFromCity(currentGame.getCity());
    renderGrid();
    renderResourcePanel();
    recordResourceSnapshot({ reason: `action:${buildMode}` });
    saveNow(`action:${buildMode}`);
  });
}

function getCurrentCityContext() {
  if (currentGame?.getCity) {
    const city = currentGame.getCity();
    return normalizeCityContext({
      name: city.nombreCiudad,
      departmentName: city.regionNombre,
      lat: city.latitud,
      lon: city.longitud,
    });
  }

  return DEFAULT_CITY_CONTEXT;
}

function initExternalApis() {
  externalDataController?.destroy?.();
  externalDataController = new ExternalDataController({
    getCityContext: getCurrentCityContext,
  });
  externalDataController.init();
}

window.cityExternalApisDebug = {
  refresh: () => externalDataController?.refreshAll?.(),
  currentCity: () => getCurrentCityContext(),
};

fetch('src/View/layouts/cityBuilderLayout.html')
  .then((res) => res.text())
  .then((html) => {
    document.getElementById('app').innerHTML = html;

    initializeGameSession();
    renderGrid();
    centerCamera();
    setupCameraControls();
    setupMapInteractions();
    setupRouteControls();
    renderResourcePanel();
    initExternalApis();

    if (currentGame) {
      currentGame.start();
      startAutosave();
      saveNow('bootstrap');
    }

    window.addEventListener('beforeunload', () => {
      saveNow('beforeunload');
    });
  })
  .catch((error) => {
    console.error('No se pudo cargar la interfaz principal:', error);
  });