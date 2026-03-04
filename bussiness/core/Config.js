export default class Config {
  constructor({
    tickMs = 10000, // HU-014: turno cada 10s
    autosaveMs = 30000, // HU-020: guardado cada 30s (tu compa lo usa)
    citizenConsumption = { electricity: 1, water: 1, food: 1 }, // X,Y,Z (UI)
    happiness = {
      base: 50,
      bonusHasHome: 10,
      bonusHasJob: 10,
      growthThreshold: 60,
      growthPerTurn: { min: 1, max: 3 },
    },
  } = {}) {
    this.tickMs = tickMs;
    this.autosaveMs = autosaveMs;

    this.citizenConsumption = this.#validateConsumption(citizenConsumption);

    this.happiness = {
      base: this.#int(happiness.base, "happiness.base"),
      bonusHasHome: this.#int(happiness.bonusHasHome, "happiness.bonusHasHome"),
      bonusHasJob: this.#int(happiness.bonusHasJob, "happiness.bonusHasJob"),
      growthThreshold: this.#int(
        happiness.growthThreshold,
        "happiness.growthThreshold",
      ),
      growthPerTurn: {
        min: this.#int(
          happiness.growthPerTurn?.min ?? 1,
          "happiness.growthPerTurn.min",
        ),
        max: this.#int(
          happiness.growthPerTurn?.max ?? 3,
          "happiness.growthPerTurn.max",
        ),
      },
    };

    if (this.happiness.growthPerTurn.min > this.happiness.growthPerTurn.max) {
      throw new Error(
        "Config: growthPerTurn.min no puede ser > growthPerTurn.max.",
      );
    }
  }

  #validateConsumption(obj) {
    if (!obj || typeof obj !== "object") {
      throw new Error("Config: citizenConsumption inválido.");
    }
    return {
      electricity: this.#num(
        obj.electricity ?? 0,
        "citizenConsumption.electricity",
      ),
      water: this.#num(obj.water ?? 0, "citizenConsumption.water"),
      food: this.#num(obj.food ?? 0, "citizenConsumption.food"),
    };
  }

  #num(v, field) {
    const n = Number(v);
    if (Number.isNaN(n))
      throw new Error(`Config: '${field}' debe ser numérico.`);
    return n;
  }

  #int(v, field) {
    const n = Number(v);
    if (!Number.isFinite(n) || !Number.isInteger(n)) {
      throw new Error(`Config: '${field}' debe ser entero.`);
    }
    return n;
  }
}
