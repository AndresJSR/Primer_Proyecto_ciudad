export default class Celda {
  constructor({ kind, buildingId = null } = {}) {
    if (!kind) throw new Error("Celda: 'kind' es requerido.");

    const allowed = ["grass", "road", "building"];
    if (!allowed.includes(kind)) {
      throw new Error(`Celda: kind inválido (${kind}).`);
    }

    if (
      kind === "building" &&
      (!buildingId || typeof buildingId !== "string")
    ) {
      throw new Error("Celda: buildingId requerido cuando kind='building'.");
    }

    if (kind !== "building" && buildingId !== null) {
      throw new Error(
        "Celda: buildingId debe ser null si kind no es 'building'.",
      );
    }

    this.kind = kind;
    this.buildingId = buildingId;
  }

  isEmpty() {
    return this.kind === "grass";
  }

  isRoad() {
    return this.kind === "road";
  }

  isBuilding() {
    return this.kind === "building";
  }

  static grass() {
    return new Celda({ kind: "grass" });
  }

  static road() {
    return new Celda({ kind: "road" });
  }

  static building(buildingId) {
    return new Celda({ kind: "building", buildingId });
  }
}
