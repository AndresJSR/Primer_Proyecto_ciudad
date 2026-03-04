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
    if (this._timerId !== null) return; // ya corriendo
    if (this.gameState.city.gameOver) return;

    this.gameState.start();

    const tickMs = this.gameState.config.tickMs ?? 10000;

    this._timerId = setInterval(() => {
      // Si está en pausa, no procesa turnos
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

    // Si el juego terminó, parar
    if (city.gameOver) {
      this.stop();
      return;
    }

    // 1) Avanzar turno
    city.incrementarTurno();

    // 2) Recursos
    const resourcesReport = this.resourceManager.processTurn();

    // Si recursos dispararon gameOver, parar
    if (city.gameOver) {
      this.gameState.setLastTickReports({
        resourcesReport,
        citizensReport: null,
        scoreReport: null,
      });
      this.#emit({ resourcesReport, citizensReport: null, scoreReport: null });
      this.stop();
      return;
    }

    // 3) Ciudadanos (felicidad / crecimiento / asignaciones)
    const citizensReport = this.citizenManager.processTurn();

    // 4) Score (si existe)
    const scoreReport =
      this.scoreManager && typeof this.scoreManager.processTurn === "function"
        ? this.scoreManager.processTurn()
        : null;

    // 5) Guardar reportes en GameState
    this.gameState.setLastTickReports({
      resourcesReport,
      citizensReport,
      scoreReport,
    });

    // 6) Emitir callback para UI
    this.#emit({ resourcesReport, citizensReport, scoreReport });
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
