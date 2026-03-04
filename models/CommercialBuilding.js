import Building from "./Building.js";

export default class CommercialBuilding extends Building {
  constructor({ id, code, x, y }) {
    super({ id, code, category: "commercial", x, y });

    this.jobs = 0;

    this.#applyVariant(code);
  }

  #applyVariant(code) {
    switch (code) {
      case "C1":
        // Tienda
        this.cost = 2000;

        this.jobs = 6;

        this.consumption = {
          electricity: 8,
          water: 0,
          food: 0,
        };

        this.production = {
          money: 500,
          electricity: 0,
          water: 0,
          food: 0,
        };

        break;

      case "C2":
        // Centro Comercial
        this.cost = 8000;

        this.jobs = 20;

        this.consumption = {
          electricity: 25,
          water: 0,
          food: 0,
        };

        this.production = {
          money: 2000,
          electricity: 0,
          water: 0,
          food: 0,
        };

        break;

      default:
        throw new Error(`CommercialBuilding: code inválido '${code}'.`);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      jobs: this.jobs,
    };
  }
}
