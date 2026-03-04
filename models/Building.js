export default class Building {
  constructor({ id, code, category, x, y }) {
    this.#requireString(id, "id");
    this.#requireString(code, "code");
    this.#requireString(category, "category");
    this.#requireInt(x, "x");
    this.#requireInt(y, "y");

    this.id = id;
    this.code = code;
    this.category = category;
    this.x = x;
    this.y = y;

    // Se setean en las hijas según variante
    this.cost = 0;
    this.consumption = { electricity: 0, water: 0, food: 0 };
    this.production = { money: 0, electricity: 0, water: 0, food: 0 };
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      category: this.category,
      x: this.x,
      y: this.y,
      cost: this.cost,
      consumption: this.consumption,
      production: this.production,
    };
  }

  // ===== Privados =====
  #requireString(v, f) {
    if (!v || typeof v !== "string")
      throw new Error(`Building: '${f}' inválido.`);
  }
  #requireInt(v, f) {
    if (!Number.isInteger(v))
      throw new Error(`Building: '${f}' debe ser entero.`);
  }
}
