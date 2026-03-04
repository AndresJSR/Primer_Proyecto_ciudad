export default class ScoreManager {
  constructor(city) {
    if (!city) throw new Error("ScoreManager requiere una ciudad.");
    this.city = city;
  }

  processTurn() {
    const city = this.city;

    const population = city.getPoblacionTotal();
    const happiness = Number(city.felicidadPromedio ?? 0);
    const money = Number(city.recursos.money ?? 0);
    const buildingsCount = city.getNumeroEdificios();

    const balanceElectricity = Number(city.recursos.electricity ?? 0);
    const balanceWater = Number(city.recursos.water ?? 0);

    // ===== Base =====
    const base = {
      population: population * 10,
      happiness: happiness * 5,
      money: money / 100,
      buildings: buildingsCount * 50,
      electricity: balanceElectricity * 2,
      water: balanceWater * 2,
    };

    const baseTotal =
      base.population +
      base.happiness +
      base.money +
      base.buildings +
      base.electricity +
      base.water;

    // ===== Bonuses / Penalties =====
    const bonuses = this.#calcBonuses({
      population,
      happiness,
      money,
      balanceElectricity,
      balanceWater,
    });
    const penalties = this.#calcPenalties({
      happiness,
      money,
      balanceElectricity,
      balanceWater,
    });

    const score = baseTotal + bonuses.total - penalties.total;

    // Guardar en City
    city.actualizarPuntuacion(score);

    // Payload útil para ranking/persistencia (tu compa lo puede guardar)
    const rankingEntry = {
      cityName: city.nombreCiudad,
      mayor: city.nombreAlcalde,
      score,
      population,
      happiness,
      turns: city.turnoActual,
      buildings: buildingsCount,
      date: new Date().toISOString(),
    };

    return {
      score,
      base,
      baseTotal,
      bonuses,
      penalties,
      rankingEntry,
    };
  }

  // =============================
  // ✅ Bonificaciones
  // =============================
  #calcBonuses({
    population,
    happiness,
    money,
    balanceElectricity,
    balanceWater,
  }) {
    let total = 0;
    const items = [];

    // Pleno empleo: todos tienen trabajo (+500)
    if (this.#allEmployed()) {
      items.push({ name: "Pleno empleo", points: 500 });
      total += 500;
    }

    // Alta satisfacción: felicidad > 80 (+300)
    if (happiness > 80) {
      items.push({ name: "Alta satisfacción", points: 300 });
      total += 300;
    }

    // Eficiencia de servicios: todos los recursos con balance positivo (+200)
    // Incluye dinero, agua, luz, comida (según tu texto).
    if (
      money > 0 &&
      balanceElectricity > 0 &&
      balanceWater > 0 &&
      Number(this.city.recursos.food ?? 0) > 0
    ) {
      items.push({ name: "Eficiencia de servicios", points: 200 });
      total += 200;
    }

    // Hito poblacional: > 1000 (+1000)
    if (population > 1000) {
      items.push({ name: "Hito poblacional", points: 1000 });
      total += 1000;
    }

    return { total, items };
  }

  #allEmployed() {
    const citizens = this.city.ciudadanos;
    if (citizens.length === 0) return false; // si no hay ciudadanos, no cuenta como pleno empleo
    return citizens.every((c) => c.jobBuildingId !== null);
  }

  // =============================
  // ✅ Penalizaciones
  // =============================
  #calcPenalties({ happiness, money, balanceElectricity, balanceWater }) {
    let total = 0;
    const items = [];

    // Déficit financiero: dinero negativo (-500)
    if (money < 0) {
      items.push({ name: "Déficit financiero", points: -500 });
      total -= 500;
    }

    // Crisis energética: electricidad negativa (-300)
    if (balanceElectricity < 0) {
      items.push({ name: "Crisis energética", points: -300 });
      total -= 300;
    }

    // Crisis hídrica: agua negativa (-300)
    if (balanceWater < 0) {
      items.push({ name: "Crisis hídrica", points: -300 });
      total -= 300;
    }

    // Inconformidad social: felicidad < 40 (-400)
    if (happiness < 40) {
      items.push({ name: "Inconformidad social", points: -400 });
      total -= 400;
    }

    // Desempleo: -10 por cada ciudadano sin trabajo
    const unemployed = this.#countUnemployed();
    if (unemployed > 0) {
      const pts = unemployed * -10;
      items.push({ name: "Desempleo", points: pts, unemployed });
      total += pts; // pts ya es negativo
    }

    return { total, items };
  }

  #countUnemployed() {
    return this.city.ciudadanos.filter((c) => c.jobBuildingId === null).length;
  }
}
