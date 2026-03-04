export default class GameState {
  constructor({ city, config } = {}) {
    if (!city) throw new Error("GameState: 'city' es requerido.");
    if (!config) throw new Error("GameState: 'config' es requerido.");

    this.city = city;
    this.config = config;

    this.status = "stopped"; // "running" | "paused" | "stopped"
    this.createdAt = Date.now();
    this.lastTickAt = null;

    // Para UI/debug (lo llena TurnSystem)
    this.lastReports = {
      resourcesReport: null,
      citizensReport: null,
      scoreReport: null,
    };
  }

  isRunning() {
    return this.status === "running";
  }

  isPaused() {
    return this.status === "paused";
  }

  start() {
    if (this.city.gameOver) return; // no inicia si ya terminó
    this.status = "running";
  }

  pause() {
    if (this.status === "running") this.status = "paused";
  }

  stop() {
    this.status = "stopped";
  }

  setLastTickReports({
    resourcesReport = null,
    citizensReport = null,
    scoreReport = null,
  } = {}) {
    this.lastTickAt = Date.now();
    this.lastReports = { resourcesReport, citizensReport, scoreReport };
  }
}
