import Building from "./Building.js";

export default class ServiceBuilding extends Building {
  constructor({ id, code, x, y }) {
    super({ id, code, category: "service", x, y });

    this.radius = 0;
    this.happinessBonus = 0;

    this.#applyVariant(code);
  }

  #applyVariant(code) {
    switch (code) {
      case "S1":
        // Estación de Policía
        this.cost = 4000;

        this.radius = 5;

        this.happinessBonus = 10;

        this.consumption = {
          electricity: 15,
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

      case "S2":
        // Estación de Bomberos
        this.cost = 4000;

        this.radius = 5;

        this.happinessBonus = 10;

        this.consumption = {
          electricity: 15,
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

      case "S3":
        // Hospital
        this.cost = 6000;

        this.radius = 7;

        this.happinessBonus = 10;

        this.consumption = {
          electricity: 20,
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
        throw new Error(`ServiceBuilding: code inválido '${code}'.`);
    }
  }

  toJSON() {
    return {
      ...super.toJSON(),
      radius: this.radius,
      happinessBonus: this.happinessBonus,
    };
  }
}
