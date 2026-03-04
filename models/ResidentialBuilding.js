import Building from "./Building.js";

export default class ResidentialBuilding extends Building {
  constructor({ id, code, x, y }) {
    super({ id, code, category: "residential", x, y });

    this.capacity = 0;

    this.#applyVariant(code);
  }

  #applyVariant(code) {
    switch (code) {
      case "R1":
        // Casa
        this.cost = 1000;

        this.capacity = 4;

        this.consumption = {
          electricity: 5,
          water: 3,
          food: 0,
        };

        this.production = {
          money: 0,
          electricity: 0,
          water: 0,
          food: 0,
        };

        break;

      case "R2":
        // Apartamento
        this.cost = 3000;

        this.capacity = 12;

        this.consumption = {
          electricity: 15,
          water: 10,
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
        throw new Error(`ResidentialBuilding: code inválido '${code}'.`);
    }
  }
}
