export default class ResourceManager {
  constructor(city, config = {}) {
    if (!city) throw new Error('ResourceManager requiere una ciudad.');
    this.city = city;
    this.citizenConsumption = config.citizenConsumption ?? {
      electricity: 0,
      water: 0,
      food: 0,
    };
  }

  previewTurn(resources = this.city.recursos.toJSON()) {
    return this.#calculateTurnBreakdown(resources);
  }

  processTurn() {
    const breakdown = this.#calculateTurnBreakdown(this.city.recursos.toJSON());

    this.city.recursos.applyTurn({
      production: breakdown.totalProduction,
      consumption: breakdown.totalConsumption,
    });

    const gameOver = this.#checkGameOver();

    return {
      ...breakdown,
      resourcesAfter: this.city.recursos.toJSON(),
      gameOver,
    };
  }

  #calculateTurnBreakdown(startResources = {}) {
    const buildingProduction = { money: 0, electricity: 0, water: 0, food: 0 };
    const buildingConsumption = { electricity: 0, water: 0, food: 0 };
    const citizenConsumption = this.#calcCitizenConsumption();
    const activeBuildings = [];
    const inactiveBuildings = [];

    let availableElectricity = Number(startResources.electricity ?? 0);
    let availableWater = Number(startResources.water ?? 0);

    const powerPlants = this.city.edificios.filter((b) => b.code === 'U1');
    const waterPlants = this.city.edificios.filter((b) => b.code === 'U2');
    const baseConsumers = this.city.edificios.filter((b) => ['residential', 'service', 'park'].includes(b.category));
    const commercialBuildings = this.city.edificios.filter((b) => b.category === 'commercial');
    const industrialBuildings = this.city.edificios.filter((b) => b.category === 'industrial');

    for (const building of powerPlants) {
      this.#mergeResources(buildingProduction, building.production);
      availableElectricity += Number(building.production?.electricity ?? 0);
      activeBuildings.push(building.id);
    }

    for (const building of baseConsumers) {
      this.#mergeResources(buildingConsumption, building.consumption);
      availableElectricity -= Number(building.consumption?.electricity ?? 0);
      availableWater -= Number(building.consumption?.water ?? 0);
      activeBuildings.push(building.id);
    }

    for (const building of waterPlants) {
      const requiredElectricity = Number(building.consumption?.electricity ?? 0);
      if (availableElectricity >= requiredElectricity) {
        this.#mergeResources(buildingConsumption, building.consumption);
        this.#mergeResources(buildingProduction, building.production);
        availableElectricity -= requiredElectricity;
        availableWater += Number(building.production?.water ?? 0);
        activeBuildings.push(building.id);
      } else {
        inactiveBuildings.push(building.id);
      }
    }

    for (const building of commercialBuildings) {
      const requiredElectricity = Number(building.consumption?.electricity ?? 0);
      if (availableElectricity >= requiredElectricity) {
        this.#mergeResources(buildingConsumption, building.consumption);
        this.#mergeResources(buildingProduction, building.production);
        availableElectricity -= requiredElectricity;
        activeBuildings.push(building.id);
      } else {
        inactiveBuildings.push(building.id);
      }
    }

    for (const building of industrialBuildings) {
      const fullElectricity = Number(building.consumption?.electricity ?? 0);
      const fullWater = Number(building.consumption?.water ?? 0);
      const enoughForFull = availableElectricity >= fullElectricity && availableWater >= fullWater;

      if (enoughForFull) {
        this.#mergeResources(buildingConsumption, building.consumption);
        this.#mergeResources(buildingProduction, building.production);
        availableElectricity -= fullElectricity;
        availableWater -= fullWater;
        activeBuildings.push(building.id);
        continue;
      }

      const halfConsumption = {
        electricity: Math.ceil(fullElectricity * 0.5),
        water: Math.ceil(fullWater * 0.5),
        food: 0,
      };

      if (availableElectricity >= halfConsumption.electricity && availableWater >= halfConsumption.water) {
        this.#mergeResources(buildingConsumption, halfConsumption);
        this.#mergeResources(buildingProduction, this.#scaleResources(building.production, 0.5));
        availableElectricity -= halfConsumption.electricity;
        availableWater -= halfConsumption.water;
        activeBuildings.push(building.id);
      } else {
        inactiveBuildings.push(building.id);
      }
    }

    const totalProduction = { ...buildingProduction };
    const totalConsumption = {
      money: 0,
      electricity: Number(buildingConsumption.electricity ?? 0) + Number(citizenConsumption.electricity ?? 0),
      water: Number(buildingConsumption.water ?? 0) + Number(citizenConsumption.water ?? 0),
      food: Number(buildingConsumption.food ?? 0) + Number(citizenConsumption.food ?? 0),
    };

    return {
      activeBuildings,
      inactiveBuildings,
      buildingProduction,
      buildingConsumption,
      citizenConsumption,
      totalProduction,
      totalConsumption,
    };
  }

  #calcCitizenConsumption() {
    const pop = this.city.ciudadanos.length;

    return {
      electricity: pop * Number(this.citizenConsumption.electricity ?? 0),
      water: pop * Number(this.citizenConsumption.water ?? 0),
      food: pop * Number(this.citizenConsumption.food ?? 0),
    };
  }

  #mergeResources(target, source = {}) {
    target.money = Number(target.money ?? 0) + Number(source.money ?? 0);
    target.electricity = Number(target.electricity ?? 0) + Number(source.electricity ?? 0);
    target.water = Number(target.water ?? 0) + Number(source.water ?? 0);
    target.food = Number(target.food ?? 0) + Number(source.food ?? 0);
    return target;
  }

  #scaleResources(source = {}, factor = 1) {
    return {
      money: Math.floor(Number(source.money ?? 0) * factor),
      electricity: Math.floor(Number(source.electricity ?? 0) * factor),
      water: Math.floor(Number(source.water ?? 0) * factor),
      food: Math.floor(Number(source.food ?? 0) * factor),
    };
  }

  #checkGameOver() {
    if (this.city.recursos.electricity < 0) {
      this.city.setGameOver('Game Over: Electricidad < 0');
      return true;
    }
    if (this.city.recursos.water < 0) {
      this.city.setGameOver('Game Over: Agua < 0');
      return true;
    }
    return false;
  }
}