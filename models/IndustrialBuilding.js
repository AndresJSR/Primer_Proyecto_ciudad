import Building from "./Building.js";

export default class IndustrialBuilding extends Building {
  constructor({ id, code, x, y }) {
    super({ id, code, category: "industrial", x, y });

    this.jobs = 0;
    this.#applyVariant(code);
  }

  #applyVariant(code) {
    switch (code) {
      case "I1":
        // Fábrica
        this.cost = 5000;
        this.jobs = 15;

        this.consumption = {
          electricity: 20,
          water: 15,
          food: 0,
        };

        this.production = {
          money: 800,
          electricity: 0,
          water: 0,
          food: 0,
        };
        break;

      case "I2":
        // Granja
        this.cost = 3000;
        this.jobs = 8;

        this.consumption = {
          electricity: 0,
          water: 10,
          food: 0,
        };

        this.production = {
          money: 0,
          electricity: 0,
          water: 0,
          food: 50,
        };
        break;

      default:
        throw new Error(`IndustrialBuilding: code inválido '${code}'.`);
    }
  }

  toJSON() {
    return { ...super.toJSON(), jobs: this.jobs };
  }
}
