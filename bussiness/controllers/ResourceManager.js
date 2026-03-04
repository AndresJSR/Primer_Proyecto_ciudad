export default class ResourceManager {
  constructor(city, config = {}) {
    if (!city) throw new Error("ResourceManager requiere una ciudad.");
    this.city = city;

    // X,Y,Z por ciudadano (configurable desde caja)
    this.citizenConsumption = config.citizenConsumption ?? {
      electricity: 0,
      water: 0,
      food: 0,
    };
  }

  processTurn() {
    const buildingProduction = this.#sumBuildingProduction();
    const buildingConsumption = this.#sumBuildingConsumption();
    const citizenConsumption = this.#calcCitizenConsumption();

    const totalProduction = buildingProduction;

    const totalConsumption = {
      money: 0,
      electricity:
        (buildingConsumption.electricity ?? 0) +
        (citizenConsumption.electricity ?? 0),
      water: (buildingConsumption.water ?? 0) + (citizenConsumption.water ?? 0),
      food: (buildingConsumption.food ?? 0) + (citizenConsumption.food ?? 0),
    };

    this.city.recursos.applyTurn({
      production: totalProduction,
      consumption: totalConsumption,
    });

    const gameOver = this.#checkGameOver();

    return {
      buildingProduction,
      buildingConsumption,
      citizenConsumption,
      totalProduction,
      totalConsumption,
      resourcesAfter: this.city.recursos.toJSON(),
      gameOver,
    };
  }

  #sumBuildingProduction() {
    const acc = { money: 0, electricity: 0, water: 0, food: 0 };

    for (const b of this.city.edificios) {
      const p = b.production ?? {};
      acc.money += Number(p.money ?? 0);
      acc.electricity += Number(p.electricity ?? 0);
      acc.water += Number(p.water ?? 0);
      acc.food += Number(p.food ?? 0);
    }

    return acc;
  }

  #sumBuildingConsumption() {
    const acc = { electricity: 0, water: 0, food: 0 };

    for (const b of this.city.edificios) {
      const c = b.consumption ?? {};
      acc.electricity += Number(c.electricity ?? 0);
      acc.water += Number(c.water ?? 0);
      acc.food += Number(c.food ?? 0);
    }

    return acc;
  }

  #calcCitizenConsumption() {
    const pop = this.city.ciudadanos.length;

    return {
      electricity: pop * Number(this.citizenConsumption.electricity ?? 0),
      water: pop * Number(this.citizenConsumption.water ?? 0),
      food: pop * Number(this.citizenConsumption.food ?? 0),
    };
  }

  #checkGameOver() {
    // Game Over: si agua o electricidad < 0
    if (this.city.recursos.electricity < 0) {
      this.city.setGameOver("Game Over: Electricidad < 0");
      return true;
    }
    if (this.city.recursos.water < 0) {
      this.city.setGameOver("Game Over: Agua < 0");
      return true;
    }
    return false;
  }
}
