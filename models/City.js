import Map from "./Map.js";
import Resources from "./Resources.js";
import Citizen from "./Citizen.js";
import BuildingFactory from "../utils/BuildingFactory.js";

export default class City {
  constructor({
    nombreCiudad,
    nombreAlcalde,
    regionNombre,
    latitud,
    longitud,
    ancho,
    alto,
    mapa,
    recursosIniciales,
  }) {
    this.#validarNombre(nombreCiudad, "Nombre de ciudad");
    this.#validarNombre(nombreAlcalde, "Nombre de alcalde");
    this.#validarCoordenadas(latitud, longitud);
    this.#validarDimensiones(ancho, alto);

    if (!(mapa instanceof Map)) {
      throw new Error("City: se requiere una instancia válida de Map.");
    }
    if (mapa.ancho !== ancho || mapa.alto !== alto) {
      throw new Error(
        "City: las dimensiones del mapa no coinciden con ancho/alto de la ciudad.",
      );
    }

    this.nombreCiudad = nombreCiudad;
    this.nombreAlcalde = nombreAlcalde;
    this.regionNombre = regionNombre;
    this.latitud = latitud;
    this.longitud = longitud;

    this.ancho = ancho;
    this.alto = alto;

    this.turnoActual = 0;
    this.puntuacionAcumulada = 0;
    this.felicidadPromedio = 0;

    this.mapa = mapa;

    this.edificios = [];
    this.ciudadanos = [];

    this.recursos = new Resources({
      money: recursosIniciales?.money ?? 50000,
      electricity: recursosIniciales?.electricity ?? 0,
      water: recursosIniciales?.water ?? 0,
      food: recursosIniciales?.food ?? 0,
    });

    this.gameOver = false;
    this.motivoGameOver = null;
    this.resourceHistory = [];
  }

  getPoblacionTotal() {
    return this.ciudadanos.length;
  }

  getNumeroEdificios() {
    return this.edificios.length;
  }

  incrementarTurno() {
    this.turnoActual++;
  }

  setGameOver(motivo) {
    this.gameOver = true;
    this.motivoGameOver = motivo;
  }

  clearGameOver() {
    this.gameOver = false;
    this.motivoGameOver = null;
  }

  recordResourceSnapshot({
    turn = this.turnoActual,
    reason = null,
    production = null,
    consumption = null,
    score = this.puntuacionAcumulada,
    happiness = this.felicidadPromedio,
  } = {}) {
    const snapshot = {
      turn,
      reason,
      timestamp: new Date().toISOString(),
      resources: this.recursos.toJSON(),
      population: this.getPoblacionTotal(),
      happiness,
      score,
      production,
      consumption,
    };

    this.resourceHistory.push(snapshot);
    if (this.resourceHistory.length > 20) {
      this.resourceHistory = this.resourceHistory.slice(-20);
    }

    return snapshot;
  }

  agregarEdificio(edificio) {
    this.edificios.push(edificio);
  }

  eliminarEdificio(id) {
    this.edificios = this.edificios.filter((e) => e.id !== id);
  }

  agregarCiudadano(ciudadano) {
    this.ciudadanos.push(ciudadano);
  }

  eliminarCiudadano(id) {
    this.ciudadanos = this.ciudadanos.filter((c) => c.id !== id);
  }

  actualizarFelicidadPromedio(valor) {
    this.felicidadPromedio = valor;
  }

  actualizarPuntuacion(valor) {
    this.puntuacionAcumulada = valor;
  }

  #validarNombre(valor, campo) {
    if (!valor || typeof valor !== "string" || valor.trim().length === 0) {
      throw new Error(`${campo} inválido.`);
    }
    if (valor.length > 50) {
      throw new Error(`${campo} no puede superar 50 caracteres.`);
    }
  }

  #validarCoordenadas(lat, lon) {
    if (typeof lat !== "number" || typeof lon !== "number") {
      throw new Error("Latitud y longitud deben ser números.");
    }
  }

  #validarDimensiones(ancho, alto) {
    if (ancho < 15 || ancho > 30 || alto < 15 || alto > 30) {
      throw new Error("El tamaño del mapa debe estar entre 15x15 y 30x30.");
    }
  }

  getHomeOccupancy(buildingId) {
    const b = this.edificios.find((e) => e.id === buildingId);
    if (!b) throw new Error("Edificio no encontrado.");
    if (b.category !== "residential") {
      throw new Error("El edificio no es residencial.");
    }

    const occupied = this.ciudadanos.filter(
      (c) => c.homeBuildingId === buildingId,
    ).length;
    const free = b.capacity - occupied;

    return { occupied, free };
  }

  getResidentialBuildings() {
    return this.edificios.filter((e) => e.category === "residential");
  }

  hasFreeHousingSlot(buildingId) {
    const { free } = this.getHomeOccupancy(buildingId);
    return free > 0;
  }

  toJSON() {
    return {
      cityName: this.nombreCiudad,
      mayor: this.nombreAlcalde,
      regionNombre: this.regionNombre,
      gridSize: { width: this.ancho, height: this.alto },
      coordinates: { lat: this.latitud, lon: this.longitud },
      turn: this.turnoActual,
      score: this.puntuacionAcumulada,
      happiness: this.felicidadPromedio,
      gameOver: this.gameOver,
      gameOverReason: this.motivoGameOver,
      resourceHistory: this.resourceHistory,
      map: this.mapa.toJSON(),
      resources: this.recursos.toJSON(),
      buildings: this.edificios.map((b) => (b.toJSON ? b.toJSON() : b)),
      citizens: this.ciudadanos.map((c) => (c.toJSON ? c.toJSON() : c)),
    };
  }

  static fromJSON(obj) {
    if (!obj || typeof obj !== "object") {
      throw new Error("City.fromJSON: objeto inválido.");
    }

    const mapa = Map.fromJSON(obj.map);
    const city = new City({
      nombreCiudad: obj.cityName,
      nombreAlcalde: obj.mayor,
      regionNombre: obj.regionNombre,
      latitud: obj.coordinates?.lat,
      longitud: obj.coordinates?.lon,
      ancho: obj.gridSize?.width,
      alto: obj.gridSize?.height,
      mapa,
      recursosIniciales: obj.resources,
    });

    city.turnoActual = obj.turn ?? 0;
    city.puntuacionAcumulada = obj.score ?? 0;
    city.felicidadPromedio = obj.happiness ?? 0;
    city.gameOver = Boolean(obj.gameOver);
    city.motivoGameOver = obj.gameOverReason ?? null;

    city.recursos = Resources.fromJSON(obj.resources ?? {});
    city.edificios = (obj.buildings ?? []).map((b) => BuildingFactory.fromJSON(b));
    city.ciudadanos = (obj.citizens ?? []).map((c) => Citizen.fromJSON(c));
    city.resourceHistory = Array.isArray(obj.resourceHistory)
      ? obj.resourceHistory.slice(-20)
      : [];

    return city;
  }
}