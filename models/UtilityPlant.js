import Building from "./Building.js";

export default class UtilityPlant extends Building {
  constructor({ id, code, x, y }) {
    super({ id, code, category: "utility", x, y });
    this.#applyVariant(code);
  }

  #applyVariant(code) {
    switch (code) {
      case "U1":
        // U1: Planta de energía (produce electricidad)
        this.cost = 10000; // TODO: costo U1 (dinero)
        this.consumption = {
          electricity: 0, // usualmente 0 (no consume electricidad)
          water: 0, // TODO si consume agua
          food: 0,
        };
        this.production = {
          money: 0,
          electricity: 200, // TODO: producción electricidad U1
          water: 0,
          food: 0,
        };
        break;

      case "U2":
        // U2: Planta de agua (produce agua)
        this.cost = 8000; // TODO: costo U2 (dinero)
        this.consumption = {
          electricity: 20, // TODO si consume electricidad
          water: 0, // usualmente 0 (no consume agua)
          food: 0,
        };
        this.production = {
          money: 0,
          electricity: 0,
          water: 150, // TODO: producción agua U2
          food: 0,
        };
        break;

      default:
        throw new Error(`UtilityPlant: code inválido '${code}'.`);
    }
  }
}
