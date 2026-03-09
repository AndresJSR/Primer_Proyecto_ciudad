import Celda from "./Cell.js";

export default class Map {
  constructor(ancho, alto) {
    this.#validarDimensiones(ancho, alto);
    this.ancho = ancho;
    this.alto = alto;

    // grid[y][x]
    this.grid = Array.from({ length: alto }, () =>
      Array.from({ length: ancho }, () => Celda.grass()),
    );
  }

  // =============================
  // ✅ Validaciones / Acceso básico
  // =============================

  isInside(x, y) {
    return (
      Number.isInteger(x) &&
      Number.isInteger(y) &&
      x >= 0 &&
      x < this.ancho &&
      y >= 0 &&
      y < this.alto
    );
  }

  getCell(x, y) {
    if (!this.isInside(x, y)) {
      throw new Error(`Map: coordenadas fuera de rango (${x},${y}).`);
    }
    return this.grid[y][x];
  }

  setCell(x, y, cell) {
    if (!this.isInside(x, y)) {
      throw new Error(`Map: coordenadas fuera de rango (${x},${y}).`);
    }
    // Validación estructural: debe ser Celda
    if (!(cell instanceof Celda)) {
      throw new Error("Map: setCell requiere una instancia de Celda.");
    }
    this.grid[y][x] = cell;
  }

  // =============================
  // 🧭 Checks rápidos de contenido
  // =============================

  isEmpty(x, y) {
    return this.getCell(x, y).isEmpty();
  }

  isRoad(x, y) {
    return this.getCell(x, y).isRoad();
  }

  isBuilding(x, y) {
    return this.getCell(x, y).isBuilding();
  }

  // =============================
  // 🚧 Vecindad (4-direcciones)
  // =============================

  hasAdjacentRoad(x, y) {
    const neighbors = [
      { x, y: y - 1 },
      { x, y: y + 1 },
      { x: x - 1, y },
      { x: x + 1, y },
    ];

    return neighbors.some(
      (n) => this.isInside(n.x, n.y) && this.isRoad(n.x, n.y),
    );
  }

  // =============================
  // 🏗️ Mutaciones físicas del grid
  // (sin reglas de negocio)
  // =============================

  placeRoad(x, y) {
    this.setCell(x, y, Celda.road());
  }

  placeBuilding(x, y, buildingId) {
    this.setCell(x, y, Celda.building(buildingId));
  }

  clearCell(x, y) {
    this.setCell(x, y, Celda.grass());
  }

  // =============================
  // 💾 Serialización simple (JSON)
  // =============================

  toJSON() {
    return {
      ancho: this.ancho,
      alto: this.alto,
      grid: this.grid.map((row) =>
        row.map((cell) => ({ kind: cell.kind, buildingId: cell.buildingId })),
      ),
    };
  }

  static fromJSON(obj) {
    if (!obj || typeof obj !== "object")
      throw new Error("Map.fromJSON: objeto inválido.");

    const mapa = new Map(obj.ancho, obj.alto);
    mapa.grid = obj.grid.map((row) =>
      row.map(
        (c) => new Celda({ kind: c.kind, buildingId: c.buildingId ?? null }),
      ),
    );
    return mapa;
  }

  // =============================
  // 🔒 Privado
  // =============================

  #validarDimensiones(ancho, alto) {
    if (!Number.isInteger(ancho) || !Number.isInteger(alto)) {
      throw new Error("Map: ancho y alto deben ser enteros.");
    }
    if (ancho < 15 || ancho > 30 || alto < 15 || alto > 30) {
      throw new Error("Map: dimensiones deben estar entre 15 y 30.");
    }
  }
}
