import ResidentialBuilding from "../models/ResidentialBuilding.js";
import CommercialBuilding from "../models/CommercialBuilding.js";
import IndustrialBuilding from "../models/IndustrialBuilding.js";
import UtilityPlant from "../models/UtilityPlant.js";
import ServiceBuilding from "../models/ServiceBuilding.js";
import ParkBuilding from "../models/ParkBuilding.js";

export default class BuildingFactory {
  static fromJSON(obj) {
    if (!obj || typeof obj !== "object") {
      throw new Error("BuildingFactory: objeto inválido.");
    }

    const id = String(obj.id);
    const code = String(obj.code);
    const x = Number(obj.x);
    const y = Number(obj.y);

    if (!code) throw new Error("BuildingFactory: falta code.");

    if (code.startsWith("R"))
      return new ResidentialBuilding({ id, code, x, y });

    if (code.startsWith("C")) return new CommercialBuilding({ id, code, x, y });

    if (code.startsWith("I")) return new IndustrialBuilding({ id, code, x, y });

    if (code.startsWith("U")) return new UtilityPlant({ id, code, x, y });

    if (code.startsWith("S")) return new ServiceBuilding({ id, code, x, y });

    if (code.startsWith("P")) return new ParkBuilding({ id, code, x, y });

    throw new Error(`BuildingFactory: code inválido '${code}'.`);
  }
}
