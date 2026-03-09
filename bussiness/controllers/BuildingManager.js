import CommercialBuilding from "../../models/CommercialBuilding.js";
import IndustrialBuilding from "../../models/IndustrialBuilding.js";
import ParkBuilding from "../../models/ParkBuilding.js";
import ResidentialBuilding from "../../models/ResidentialBuilding.js";
import ServiceBuilding from "../../models/ServiceBuilding.js";
import UtilityPlant from "../../models/UtilityPlant.js";

export default class BuildingManager {
  constructor(city, config = {}) {
    if (!city) throw new Error("BuildingManager requiere una ciudad.");
    this.city = city;

    this.roadCost = 100; // según documento
    this.refundRate = 0.5; // 50% reembolso edificios
  }

  // =============================
  // 🛣️ Construir Vía
  // =============================
  buildRoad(x, y) {
    this.#validateInsideMap(x, y);

    const cell = this.city.mapa.getCell(x, y);
    if (!cell.isEmpty()) {
      return { ok: false, message: "La celda no está vacía." };
    }

    if (!this.city.recursos.canAfford({ money: this.roadCost })) {
      return { ok: false, message: "Dinero insuficiente." };
    }

    this.city.recursos.subtract({ money: this.roadCost });
    this.city.mapa.placeRoad(x, y);

    return { ok: true };
  }

  // =============================
  // 🏗️ Construir Edificio
  // =============================
  buildBuilding(code, x, y) {
    this.#validateInsideMap(x, y);

    const cell = this.city.mapa.getCell(x, y);
    if (!cell.isEmpty()) {
      return { ok: false, message: "La celda no está vacía." };
    }

    if (!this.#hasAdjacentRoad(x, y)) {
      return { ok: false, message: "Debe tener una vía adyacente." };
    }

    const building = this.#createBuilding(code, x, y);

    if (!this.city.recursos.canAfford({ money: building.cost })) {
      return { ok: false, message: "Dinero insuficiente." };
    }

    // Registrar
    this.city.recursos.subtract({ money: building.cost });
    this.city.edificios.push(building);
    this.city.mapa.placeBuilding(x, y, building.id);

    return { ok: true };
  }

  // =============================
  // 🧨 Demoler
  // =============================
  demolish(x, y) {
    this.#validateInsideMap(x, y);

    const cell = this.city.mapa.getCell(x, y);

    if (cell.isRoad()) {
      this.city.mapa.clearCell(x, y);
      return { ok: true };
    }

    if (cell.isBuilding()) {
      const id = cell.buildingId;

      const index = this.city.edificios.findIndex((b) => b.id === id);
      if (index === -1) {
        return { ok: false, message: "Edificio no encontrado." };
      }

      const building = this.city.edificios[index];

      // Reembolso 50%
      const refund = Math.floor(building.cost * this.refundRate);
      this.city.recursos.add({ money: refund });

      // Desasignar ciudadanos afectados
      this.city.ciudadanos.forEach((c) => {
        if (c.homeBuildingId === id) c.setHome(null);
        if (c.jobBuildingId === id) c.setJob(null);
      });

      // Eliminar edificio
      this.city.edificios.splice(index, 1);
      this.city.mapa.clearCell(x, y);

      return { ok: true };
    }

    return { ok: false, message: "Nada que demoler." };
  }

  // =============================
  // 🔍 Helpers privados
  // =============================

  #validateInsideMap(x, y) {
    if (!this.city.mapa.isInside(x, y)) {
      throw new Error("Coordenadas fuera del mapa.");
    }
  }

  #hasAdjacentRoad(x, y) {
    const dirs = [
      [0, -1],
      [0, 1],
      [-1, 0],
      [1, 0],
    ];

    for (const [dx, dy] of dirs) {
      const nx = x + dx;
      const ny = y + dy;

      if (this.city.mapa.isInside(nx, ny)) {
        const cell = this.city.mapa.getCell(nx, ny);
        if (cell.isRoad()) return true;
      }
    }

    return false;
  }

  #createBuilding(code, x, y) {
    const id = crypto.randomUUID();

    if (code.startsWith("R"))
      return new ResidentialBuilding({ id, code, x, y });
    if (code.startsWith("C")) return new CommercialBuilding({ id, code, x, y });
    if (code.startsWith("I")) return new IndustrialBuilding({ id, code, x, y });
    if (code.startsWith("S")) return new ServiceBuilding({ id, code, x, y });
    if (code.startsWith("U")) return new UtilityPlant({ id, code, x, y });
    if (code.startsWith("P")) return new ParkBuilding({ id, code, x, y });

    throw new Error(`Código inválido: ${code}`);
  }
}
