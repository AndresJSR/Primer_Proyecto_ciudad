export default class Citizen {
  constructor({
    id,
    felicidad = 50,
    homeBuildingId = null,
    jobBuildingId = null,
  } = {}) {
    this.#requireString(id, "id");
    this.#requireNumber(felicidad, "felicidad");

    this.id = id;
    this.felicidad = this.#clamp(felicidad, 0, 100);

    // Referencias (mejor que booleanos)
    this.homeBuildingId = homeBuildingId;
    this.jobBuildingId = jobBuildingId;
  }

  // =============================
  // Helpers simples
  // =============================

  hasHome() {
    return this.homeBuildingId !== null;
  }

  hasJob() {
    return this.jobBuildingId !== null;
  }

  setHome(buildingId) {
    // Setter estructural: no decide si “puede”, solo asigna
    if (buildingId !== null) this.#requireString(buildingId, "homeBuildingId");
    this.homeBuildingId = buildingId;
  }

  setJob(buildingId) {
    if (buildingId !== null) this.#requireString(buildingId, "jobBuildingId");
    this.jobBuildingId = buildingId;
  }

  setFelicidad(value) {
    this.#requireNumber(value, "felicidad");
    this.felicidad = this.#clamp(value, 0, 100);
  }

  // =============================
  // Serialización
  // =============================

  toJSON() {
    return {
      id: this.id,
      felicidad: this.felicidad,
      homeBuildingId: this.homeBuildingId,
      jobBuildingId: this.jobBuildingId,
    };
  }

  static fromJSON(obj) {
    if (!obj || typeof obj !== "object") {
      throw new Error("Citizen.fromJSON: objeto inválido.");
    }

    return new Citizen({
      id: String(obj.id),
      felicidad:
        typeof obj.felicidad === "number"
          ? obj.felicidad
          : Number(obj.felicidad ?? 50),
      homeBuildingId: obj.homeBuildingId ?? null,
      jobBuildingId: obj.jobBuildingId ?? null,
    });
  }

  // =============================
  // Privados
  // =============================

  #requireString(v, field) {
    if (!v || typeof v !== "string") {
      throw new Error(`Citizen: '${field}' debe ser string no vacío.`);
    }
  }

  #requireNumber(v, field) {
    if (typeof v !== "number" || Number.isNaN(v)) {
      throw new Error(`Citizen: '${field}' debe ser número válido.`);
    }
  }

  #clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
}
