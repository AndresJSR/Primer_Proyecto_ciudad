import Building from "./Building.js";

export default class ParkBuilding extends Building {
  constructor({ id, code, x, y }) {
    super({ id, code, category: "park", x, y });

    this.happinessBonus = 0;

    this.#applyVariant(code);
  }

  #applyVariant(code) {
    switch (code) {
      case "P1":
        // Parque
        this.cost = 1500;

        this.happinessBonus = 5;

        this.consumption = {
          electricity: 0,
          water: 0,
          food: 0,
        };

        this.production = {
          money: 0,
          electricity: 0,
          water: 0,
          food: 0,
        };

        break;

      default:
        throw new Error(`ParkBuilding: code inválido '${code}'.`);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      happinessBonus: this.happinessBonus,
    };
  }
}
