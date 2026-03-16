import Config from "./Config.js";
import GameState from "./GameState.js";
import TurnSystem from "./TurnSystem.js";

import City from "../../models/City.js";
import Map from "../../models/Map.js";

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

  createNewCity({
    nombreCiudad,
    nombreAlcalde,
    regionNombre = "",
    latitud,
    longitud,
    ancho,
    alto,
    recursosIniciales = null,
    mapa = null,
  }) {
    const cityMap = mapa instanceof Map ? mapa : new Map(ancho, alto);

    const city = new City({
      nombreCiudad,
      nombreAlcalde,
      regionNombre,
      latitud,
      longitud,
      ancho,
      alto,
      mapa: cityMap,
      recursosIniciales,
    });

    this.#bootstrap(city);
    return this.gameState;
  }

  loadExistingCity({ city, config = null } = {}) {
    if (!(city instanceof City)) {
      throw new Error("Game.loadExistingCity: se requiere una instancia de City.");
    }

    if (config) {
      this.config = config instanceof Config ? config : new Config(config);
    }

    this.#bootstrap(city);
    return this.gameState;
  }

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
    this.#requireBootstrapped();
    this.turnSystem.tick();
  }

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

  getState() {
    this.#requireBootstrapped();
    return this.gameState;
  }

  getCity() {
    this.#requireBootstrapped();
    return this.gameState.city;
  }

  #bootstrap(city) {
    this.gameState = new GameState({ city, config: this.config });

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

    this.turnSystem = new TurnSystem({
      gameState: this.gameState,
      resourceManager: this.resourceManager,
      citizenManager: this.citizenManager,
      scoreManager: this.scoreManager,
      onTick: this.onTick,
    });

    if (typeof city.recordResourceSnapshot === "function" && city.resourceHistory.length === 0) {
      city.recordResourceSnapshot({
        reason: "bootstrap",
        production: this.#previewProduction(),
        consumption: this.#previewConsumption(),
      });
    }

    return this.gameState;
  }

  #previewProduction() {
    const acc = { money: 0, electricity: 0, water: 0, food: 0 };
    for (const building of this.gameState?.city?.edificios ?? []) {
      const production = building.production ?? {};
      acc.money += Number(production.money ?? 0);
      acc.electricity += Number(production.electricity ?? 0);
      acc.water += Number(production.water ?? 0);
      acc.food += Number(production.food ?? 0);
    }
    return acc;
  }

  #previewConsumption() {
    const city = this.gameState?.city;
    const acc = { money: 0, electricity: 0, water: 0, food: 0 };

    for (const building of city?.edificios ?? []) {
      const consumption = building.consumption ?? {};
      acc.electricity += Number(consumption.electricity ?? 0);
      acc.water += Number(consumption.water ?? 0);
      acc.food += Number(consumption.food ?? 0);
    }

    const population = city?.ciudadanos?.length ?? 0;
    acc.electricity += population * Number(this.config.citizenConsumption.electricity ?? 0);
    acc.water += population * Number(this.config.citizenConsumption.water ?? 0);
    acc.food += population * Number(this.config.citizenConsumption.food ?? 0);

    return acc;
  }

  #requireBootstrapped() {
    if (!this.gameState || !this.turnSystem) {
      throw new Error(
        "Game: no hay ciudad inicializada. Llama createNewCity(...) primero.",
      );
    }
  }
}