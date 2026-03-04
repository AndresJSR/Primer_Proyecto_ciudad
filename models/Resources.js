export default class Resources {
  constructor({ money = 0, electricity = 0, water = 0, food = 0 } = {}) {
    this.#requireNumber(money, "money");
    this.#requireNumber(electricity, "electricity");
    this.#requireNumber(water, "water");
    this.#requireNumber(food, "food");

    this.money = money;
    this.electricity = electricity;
    this.water = water;
    this.food = food;
  }

  // =============================
  // ✅ Operaciones básicas
  // =============================

  clone() {
    return new Resources(this.toJSON());
  }

  add({ money = 0, electricity = 0, water = 0, food = 0 } = {}) {
    this.money += Number(money);
    this.electricity += Number(electricity);
    this.water += Number(water);
    this.food += Number(food);
    return this;
  }

  subtract({ money = 0, electricity = 0, water = 0, food = 0 } = {}) {
    this.money -= Number(money);
    this.electricity -= Number(electricity);
    this.water -= Number(water);
    this.food -= Number(food);
    return this;
  }

  canAfford({ money = 0 } = {}) {
    // Para comprar, normalmente solo importa dinero.
    // Si tu doc dice que también cuesta agua/electricidad, amplía aquí.
    return this.money >= Number(money);
  }

  // Aplica producción y consumo en un turno
  applyTurn({ production = {}, consumption = {} } = {}) {
    this.add(production);
    this.subtract(consumption);
    return this;
  }

  // =============================
  // 💾 Serialización
  // =============================

  toJSON() {
    return {
      money: this.money,
      electricity: this.electricity,
      water: this.water,
      food: this.food,
    };
  }

  static fromJSON(obj) {
    if (!obj || typeof obj !== "object") {
      throw new Error("Resources.fromJSON: objeto inválido.");
    }
    return new Resources(obj);
  }

  // =============================
  // 🔒 Privados
  // =============================

  #requireNumber(v, field) {
    if (typeof v !== "number" || Number.isNaN(v)) {
      throw new Error(`Resources: '${field}' debe ser número válido.`);
    }
  }
}
