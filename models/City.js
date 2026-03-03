export default class City {
  constructor({
    nombreCiudad,
    nombreAlcalde,
    regionNombre,
    latitud,
    longitud,
    ancho,
    alto,
    mapa,
    recursosIniciales,
  }) {
    // 🔒 Validaciones estructurales
    this.#validarNombre(nombreCiudad, "Nombre de ciudad");
    this.#validarNombre(nombreAlcalde, "Nombre de alcalde");
    this.#validarCoordenadas(latitud, longitud);
    this.#validarDimensiones(ancho, alto);

    if (!mapa) {
      throw new Error("La ciudad debe tener un mapa válido.");
    }

    // 📌 Datos básicos
    this.nombreCiudad = nombreCiudad;
    this.nombreAlcalde = nombreAlcalde;
    this.regionNombre = regionNombre;
    this.latitud = latitud;
    this.longitud = longitud;

    this.ancho = ancho;
    this.alto = alto;

    this.turnoActual = 0;
    this.puntuacionAcumulada = 0;
    this.felicidadPromedio = 0;

    // 🗺️ Territorio
    this.mapa = mapa;

    // 🏗️ Colecciones
    this.edificios = [];
    this.vias = [];
    this.ciudadanos = [];

    // 💰 Recursos
    this.recursos = {
      dinero: recursosIniciales?.dinero ?? 50000,
      electricidad: recursosIniciales?.electricidad ?? 0,
      agua: recursosIniciales?.agua ?? 0,
      alimentos: recursosIniciales?.alimentos ?? 0,
    };

    // 🛑 Estado del juego
    this.gameOver = false;
    this.motivoGameOver = null;
  }

  // =============================
  // 📊 Métodos básicos de consulta
  // =============================

  getPoblacionTotal() {
    return this.ciudadanos.length;
  }

  getNumeroEdificios() {
    return this.edificios.length;
  }

  incrementarTurno() {
    this.turnoActual++;
  }

  setGameOver(motivo) {
    this.gameOver = true;
    this.motivoGameOver = motivo;
  }

  // =============================
  // 🏗️ Métodos de modificación simple
  // (Sin lógica pesada)
  // =============================

  agregarEdificio(edificio) {
    this.edificios.push(edificio);
  }

  eliminarEdificio(id) {
    this.edificios = this.edificios.filter((e) => e.id !== id);
  }

  agregarVia(via) {
    this.vias.push(via);
  }

  eliminarVia(x, y) {
    this.vias = this.vias.filter((v) => !(v.x === x && v.y === y));
  }

  agregarCiudadano(ciudadano) {
    this.ciudadanos.push(ciudadano);
  }

  eliminarCiudadano(id) {
    this.ciudadanos = this.ciudadanos.filter((c) => c.id !== id);
  }

  actualizarFelicidadPromedio(valor) {
    this.felicidadPromedio = valor;
  }

  actualizarPuntuacion(valor) {
    this.puntuacionAcumulada = valor;
  }

  // =============================
  // 🔒 Validaciones privadas
  // =============================

  #validarNombre(valor, campo) {
    if (!valor || typeof valor !== "string" || valor.trim().length === 0) {
      throw new Error(`${campo} inválido.`);
    }
    if (valor.length > 50) {
      throw new Error(`${campo} no puede superar 50 caracteres.`);
    }
  }

  #validarCoordenadas(lat, lon) {
    if (typeof lat !== "number" || typeof lon !== "number") {
      throw new Error("Latitud y longitud deben ser números.");
    }
  }

  #validarDimensiones(ancho, alto) {
    if (ancho < 15 || ancho > 30 || alto < 15 || alto > 30) {
      throw new Error("El tamaño del mapa debe estar entre 15x15 y 30x30.");
    }
  }
}
