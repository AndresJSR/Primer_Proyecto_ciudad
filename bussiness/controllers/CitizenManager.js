import Citizen from '../../models/Citizen.js';

export default class CitizenManager {
  constructor(city, config = {}) {
    if (!city) throw new Error('CitizenManager requiere una ciudad.');
    this.city = city;

    this.baseHappiness = config.baseHappiness ?? 50;
    this.bonusHasHome = config.bonusHasHome ?? 10;
    this.bonusHasJob = config.bonusHasJob ?? 10;
    this.growthMin = config.growthPerTurn?.min ?? 1;
    this.growthMax = config.growthPerTurn?.max ?? 3;
    this.growthHappinessThreshold = config.growthHappinessThreshold ?? 60;
  }

  processTurn() {
    this.assignHomes();
    this.assignJobs();

    const avg = this.recalculateHappiness();
    this.city.actualizarFelicidadPromedio(avg);

    const created = this.tryPopulationGrowth(avg);

    return {
      happinessAverage: avg,
      citizensCreated: created,
      population: this.city.ciudadanos.length,
    };
  }

  assignHomes() {
    const homes = this.city.getResidentialBuildings();

    for (const citizen of this.city.ciudadanos) {
      if (citizen.hasHome()) continue;

      const home = this.#findHomeWithSpace(homes);
      if (!home) break;

      citizen.setHome(home.id);
    }
  }

  #findHomeWithSpace(homes) {
    for (const b of homes) {
      if (this.city.hasFreeHousingSlot(b.id)) return b;
    }
    return null;
  }

  assignJobs() {
    const jobBuildings = this.#getJobBuildings();

    for (const citizen of this.city.ciudadanos) {
      if (citizen.hasJob()) continue;

      const jobB = this.#findJobWithSpace(jobBuildings);
      if (!jobB) break;

      citizen.setJob(jobB.id);
    }
  }

  #getJobBuildings() {
    return this.city.edificios.filter(
      (b) => b.category === 'commercial' || b.category === 'industrial',
    );
  }

  #getJobOccupancy(buildingId, jobs) {
    const occupied = this.city.ciudadanos.filter(
      (c) => c.jobBuildingId === buildingId,
    ).length;
    const free = jobs - occupied;
    return { occupied, free };
  }

  #findJobWithSpace(jobBuildings) {
    for (const b of jobBuildings) {
      const { free } = this.#getJobOccupancy(b.id, b.jobs);
      if (free > 0) return b;
    }
    return null;
  }

  recalculateHappiness() {
    const globalBonus = this.#globalHappinessBonus();

    if (this.city.ciudadanos.length === 0) {
      return this.#clamp(this.baseHappiness + globalBonus, 0, 100);
    }

    let sum = 0;

    for (const citizen of this.city.ciudadanos) {
      let h = this.baseHappiness;

      if (citizen.hasHome()) h += this.bonusHasHome;
      if (citizen.hasJob()) h += this.bonusHasJob;

      h += globalBonus;

      citizen.setFelicidad(this.#clamp(h, 0, 100));
      sum += citizen.felicidad;
    }

    return sum / this.city.ciudadanos.length;
  }

  #globalHappinessBonus() {
    let bonus = 0;

    for (const b of this.city.edificios) {
      if (b.category === 'service' || b.category === 'park') {
        bonus += Number(b.happinessBonus ?? 0);
      }
    }

    return bonus;
  }

  tryPopulationGrowth(avgHappiness) {
    if (!this.#hasAnyHousingSpace()) return 0;
    if (!this.#hasAnyJobSpace()) return 0;

    if (this.city.ciudadanos.length === 0) {
      return this.#createCitizens(1);
    }

    if (avgHappiness < this.growthHappinessThreshold) return 0;

    return this.#createCitizens(this.#randInt(this.growthMin, this.growthMax));
  }

  #createCitizens(amount) {
    for (let i = 0; i < amount; i++) {
      const citizen = new Citizen({
        id: crypto.randomUUID(),
        felicidad: this.baseHappiness,
        homeBuildingId: null,
        jobBuildingId: null,
      });

      this.city.agregarCiudadano(citizen);
    }

    this.assignHomes();
    this.assignJobs();
    return amount;
  }

  #hasAnyHousingSpace() {
    const homes = this.city.getResidentialBuildings();
    return homes.some((h) => this.city.hasFreeHousingSlot(h.id));
  }

  #hasAnyJobSpace() {
    const jobBuildings = this.#getJobBuildings();
    return jobBuildings.some((b) => {
      const { free } = this.#getJobOccupancy(b.id, b.jobs);
      return free > 0;
    });
  }

  #randInt(min, max) {
    const lo = Math.ceil(min);
    const hi = Math.floor(max);
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  }

  #clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
}