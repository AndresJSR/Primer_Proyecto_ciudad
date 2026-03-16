export default class TurnSystem {
  constructor({
    gameState,
    resourceManager,
    citizenManager,
    scoreManager = null,
    onTick = null,
  } = {}) {
    if (!gameState) throw new Error("TurnSystem: 'gameState' es requerido.");
    if (!resourceManager)
      throw new Error("TurnSystem: 'resourceManager' es requerido.");
    if (!citizenManager)
      throw new Error("TurnSystem: 'citizenManager' es requerido.");

    this.gameState = gameState;
    this.resourceManager = resourceManager;
    this.citizenManager = citizenManager;
    this.scoreManager = scoreManager;

    this.onTick = onTick;

    this._timerId = null;
  }

  start() {
    if (this._timerId !== null) return;
    if (this.gameState.city.gameOver) return;

    this.gameState.start();

    const tickMs = this.gameState.config.tickMs ?? 10000;

    this._timerId = setInterval(() => {
      if (this.gameState.isPaused()) return;
      this.tick();
    }, tickMs);
  }

  stop() {
    if (this._timerId !== null) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
    this.gameState.stop();
  }

  pause() {
    this.gameState.pause();
  }

  resume() {
    if (this.gameState.city.gameOver) return;
    this.gameState.start();
  }

  tick() {
    const city = this.gameState.city;

    if (city.gameOver) {
      this.stop();
      return;
    }

    city.incrementarTurno();

    const resourcesReport = this.resourceManager.processTurn();

    if (city.gameOver) {
      const payload = {
        resourcesReport,
        citizensReport: null,
        scoreReport: null,
      };

      this.#recordHistory(payload);
      this.gameState.setLastTickReports(payload);
      this.#emit(payload);
      this.stop();
      return;
    }

    const citizensReport = this.citizenManager.processTurn();

    const scoreReport =
      this.scoreManager && typeof this.scoreManager.processTurn === "function"
        ? this.scoreManager.processTurn()
        : null;

    const payload = { resourcesReport, citizensReport, scoreReport };

    this.#recordHistory(payload);
    this.gameState.setLastTickReports(payload);
    this.#emit(payload);
  }

  #recordHistory({ resourcesReport = null, scoreReport = null } = {}) {
    const city = this.gameState.city;
    if (typeof city.recordResourceSnapshot !== "function") return;

    city.recordResourceSnapshot({
      turn: city.turnoActual,
      reason: city.gameOver ? "game-over" : "turn",
      production: resourcesReport?.totalProduction ?? null,
      consumption: resourcesReport?.totalConsumption ?? null,
      score: scoreReport?.score ?? city.puntuacionAcumulada,
      happiness: city.felicidadPromedio,
    });
  }

  #emit(payload) {
    if (typeof this.onTick === "function") {
      this.onTick({
        turn: this.gameState.city.turnoActual,
        city: this.gameState.city,
        ...payload,
      });
    }
  }
}