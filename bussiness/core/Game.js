import Config from "./Config.js";
import GameState from "./GameState.js";
import TurnSystem from "./TurnSystem.js";

import City from "../models/City.js";
import Map from "../models/Map.js";

import BuildingManager from "../controllers/BuildingManager.js";
import CitizenManager from "../controllers/CitizenManager.js";
import ResourceManager from "../controllers/ResourceManager.js";
import ScoreManager from "../controllers/ScoreManager.js";

export default class Game {
  constructor({ config = null, onTick = null } = {}) {
    this.config = config instanceof Config ? config : new Config(config ?? {});

    this.onTick = onTick;

    this.gameState = null;

    this.buildingManager = null;
    this.resourceManager = null;
    this.citizenManager = null;
    this.scoreManager = null;

    this.turnSystem = null;
  }

  // =============================
  // 🚀 Crear nueva ciudad / iniciar juego
  // =============================
  createNewCity({
    nombreCiudad,
    nombreAlcalde,
    regionNombre = "",
    latitud,
    longitud,
    ancho,
    alto,
    recursosIniciales = null,
  }) {
    const mapa = new Map(ancho, alto);

    const city = new City({
      nombreCiudad,
      nombreAlcalde,
      regionNombre,
      latitud,
      longitud,
      ancho,
      alto,
      mapa,
      recursosIniciales,
    });

    this.#bootstrap(city);
    return this.gameState;
  }

  // =============================
  // ▶️ Control del ciclo
  // =============================
  start() {
    this.#requireBootstrapped();
    this.turnSystem.start();
  }

  pause() {
    this.#requireBootstrapped();
    this.turnSystem.pause();
  }

  resume() {
    this.#requireBootstrapped();
    this.turnSystem.resume();
  }

  stop() {
    this.#requireBootstrapped();
    this.turnSystem.stop();
  }

  tickOnce() {
    // Útil para pruebas: ejecuta 1 turno sin esperar 10s
    this.#requireBootstrapped();
    this.turnSystem.tick();
  }

  // =============================
  // 🏗️ Acciones del jugador (delegadas)
  // =============================
  buildRoad(x, y) {
    this.#requireBootstrapped();
    return this.buildingManager.buildRoad(x, y);
  }

  buildBuilding(code, x, y) {
    this.#requireBootstrapped();
    return this.buildingManager.buildBuilding(code, x, y);
  }

  demolish(x, y) {
    this.#requireBootstrapped();
    return this.buildingManager.demolish(x, y);
  }

  // =============================
  // 🔎 Lectura de estado (para UI)
  // =============================
  getState() {
    this.#requireBootstrapped();
    return this.gameState;
  }

  getCity() {
    this.#requireBootstrapped();
    return this.gameState.city;
  }

  // =============================
  // 🔧 Internos
  // =============================
  #bootstrap(city) {
    // 1) GameState
    this.gameState = new GameState({ city, config: this.config });

    // 2) Managers (inyección de config)
    this.buildingManager = new BuildingManager(city);

    this.resourceManager = new ResourceManager(city, {
      citizenConsumption: this.config.citizenConsumption,
    });

    this.citizenManager = new CitizenManager(city, {
      baseHappiness: this.config.happiness.base,
      bonusHasHome: this.config.happiness.bonusHasHome,
      bonusHasJob: this.config.happiness.bonusHasJob,
      growthHappinessThreshold: this.config.happiness.growthThreshold,
      growthPerTurn: this.config.happiness.growthPerTurn,
    });

    this.scoreManager = new ScoreManager(city);

    // 3) TurnSystem
    this.turnSystem = new TurnSystem({
      gameState: this.gameState,
      resourceManager: this.resourceManager,
      citizenManager: this.citizenManager,
      scoreManager: this.scoreManager,
      onTick: this.onTick,
    });

    return this.gameState;
  }

  #requireBootstrapped() {
    if (!this.gameState || !this.turnSystem) {
      throw new Error(
        "Game: no hay ciudad inicializada. Llama createNewCity(...) primero.",
      );
    }
  }
}
