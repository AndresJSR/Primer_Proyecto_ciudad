import Game from "./bussiness/core/Game.js";

import Citizen from "./models/Citizen.js";
const game = new Game({
  config: {
    tickMs: 10000,
    citizenConsumption: {
      electricity: 1,
      water: 1,
      food: 1,
    },
    happiness: {
      base: 50,
      bonusHasHome: 10,
      bonusHasJob: 10,
      growthThreshold: 60,
      growthPerTurn: { min: 1, max: 3 },
    },
  },
  onTick: ({ turn, city, resourcesReport, citizensReport, scoreReport }) => {
    console.log(`\n=== TURNO ${turn} ===`);
    console.log("Recursos:", city.recursos.toJSON());
    console.log("Población:", city.getPoblacionTotal());
    console.log("Felicidad promedio:", city.felicidadPromedio);
    console.log("Puntuación:", city.puntuacionAcumulada);

    if (resourcesReport) console.log("Reporte recursos:", resourcesReport);
    if (citizensReport) console.log("Reporte ciudadanos:", citizensReport);
    if (scoreReport) console.log("Reporte score:", scoreReport);
  },
});

// 1) Crear ciudad
game.createNewCity({
  nombreCiudad: "Ciudad Prueba",
  nombreAlcalde: "Vic",
  regionNombre: "Medellín",
  latitud: 6.2442,
  longitud: -75.5812,
  ancho: 15,
  alto: 15,
  recursosIniciales: {
    money: 50000,
    electricity: 0,
    water: 0,
    food: 0,
  },
});

console.log("Ciudad creada:", game.getCity());

// 2) Construir unas vías
game.buildRoad(3, 2);
game.buildRoad(3, 3);
game.buildRoad(3, 4);
game.buildRoad(4, 3);
game.buildRoad(5, 3);
game.buildRoad(6, 3);
game.buildRoad(7, 3);

// 3) Construir utilidades primero
console.log("Construir U1:", game.buildBuilding("U1", 2, 3)); // planta eléctrica
console.log("Construir U2:", game.buildBuilding("U2", 8, 3)); // planta de agua

// 4) Construir vivienda y empleo
console.log("Construir R1:", game.buildBuilding("R1", 3, 2)); // casa
console.log("Construir C1:", game.buildBuilding("C1", 5, 2)); // tienda
console.log("Construir P1:", game.buildBuilding("P1", 7, 2)); // parque

// 5) Crear 2 ciudadanos manualmente para probar asignaciones
game.getCity().agregarCiudadano({
  id: crypto.randomUUID(),
  felicidad: 50,
  homeBuildingId: null,
  jobBuildingId: null,
  hasHome() {
    return this.homeBuildingId !== null;
  },
  hasJob() {
    return this.jobBuildingId !== null;
  },
  setHome(id) {
    this.homeBuildingId = id;
  },
  setJob(id) {
    this.jobBuildingId = id;
  },
  setFelicidad(v) {
    this.felicidad = v;
  },
});

game.getCity().agregarCiudadano({
  id: crypto.randomUUID(),
  felicidad: 50,
  homeBuildingId: null,
  jobBuildingId: null,
  hasHome() {
    return this.homeBuildingId !== null;
  },
  hasJob() {
    return this.jobBuildingId !== null;
  },
  setHome(id) {
    this.homeBuildingId = id;
  },
  setJob(id) {
    this.jobBuildingId = id;
  },
  setFelicidad(v) {
    this.felicidad = v;
  },
});

// 6) Ejecutar varios turnos manualmente
for (let i = 0; i < 5; i++) {
  game.tickOnce();
}

// 7) Estado final
console.log("\n=== ESTADO FINAL ===");
console.log("Recursos:", game.getCity().recursos.toJSON());
console.log("Población:", game.getCity().getPoblacionTotal());
console.log("Edificios:", game.getCity().getNumeroEdificios());
console.log("Felicidad promedio:", game.getCity().felicidadPromedio);
console.log("Puntuación:", game.getCity().puntuacionAcumulada);
console.log(
  "Game Over:",
  game.getCity().gameOver,
  game.getCity().motivoGameOver,
);
