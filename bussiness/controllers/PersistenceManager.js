/**
 * Persistencia de la partida, mapa y ranking en LocalStorage.
 * Compatible con el save legacy del proyecto y con snapshots más completos.
 */

import City from '../../models/City.js';
import FileLoaderController from '../../src/Business/Controllers/FileLoaderController.js';

export default class Persistence {
  static CITY_KEY = 'city_save';
  static RANKING_KEY = 'city_ranking';
  static MAP_KEY = 'city_last_map';
  static SNAPSHOT_VERSION = 2;

  static hasSavedCity() {
    return Boolean(localStorage.getItem(Persistence.CITY_KEY));
  }

  static saveCity(city, {
    config = null,
    gameState = null,
    mapDefinition = null,
    metadata = {},
  } = {}) {
    try {
      const baseCity =
        typeof city?.toJSON === 'function' ? city.toJSON() : { ...(city ?? {}) };

      // El City original no serializa estos campos, así que los agregamos acá.
      const serializableCity = {
        ...baseCity,
        gameOver: Boolean(city?.gameOver ?? baseCity.gameOver ?? false),
        gameOverReason:
          city?.motivoGameOver ??
          baseCity.gameOverReason ??
          baseCity.motivoGameOver ??
          null,
        resourceHistory: Array.isArray(city?.resourceHistory)
          ? city.resourceHistory.slice(-20)
          : Array.isArray(baseCity.resourceHistory)
            ? baseCity.resourceHistory.slice(-20)
            : [],
      };

      const snapshot = {
        version: Persistence.SNAPSHOT_VERSION,
        savedAt: new Date().toISOString(),
        city: serializableCity,
        config: Persistence.#serializeConfig(config),
        gameState: gameState
          ? {
              status: gameState.status ?? 'stopped',
              createdAt: gameState.createdAt ?? null,
              lastTickAt: gameState.lastTickAt ?? null,
            }
          : null,
        mapDefinition: mapDefinition ?? Persistence.loadMapDefinition(),
        metadata,
      };

      localStorage.setItem(Persistence.CITY_KEY, JSON.stringify(snapshot));
      return snapshot;
    } catch (error) {
      console.error('Error al guardar ciudad:', error);
      return null;
    }
  }

  static loadCitySnapshot() {
    try {
      const rawJSON = localStorage.getItem(Persistence.CITY_KEY);
      if (!rawJSON) return null;

      const parsed = JSON.parse(rawJSON);

      // Snapshot nuevo
      if (parsed?.version && parsed?.city) {
        return parsed;
      }

      // Compatibilidad con el formato viejo: solo guardaba la ciudad
      return {
        version: 1,
        savedAt: null,
        city: parsed,
        config: null,
        gameState: null,
        mapDefinition: Persistence.loadMapDefinition(),
        metadata: { legacy: true },
      };
    } catch (error) {
      console.error('Error al cargar snapshot:', error);
      return null;
    }
  }

  static loadCity() {
    try {
      const snapshot = Persistence.loadCitySnapshot();
      if (!snapshot?.city) return null;

      const city = City.fromJSON(snapshot.city);

      // Rehidratación extra porque City.fromJSON original no restaura esto
      city.gameOver = Boolean(snapshot.city.gameOver ?? false);
      city.motivoGameOver =
        snapshot.city.gameOverReason ??
        snapshot.city.motivoGameOver ??
        null;

      city.resourceHistory = Array.isArray(snapshot.city.resourceHistory)
        ? snapshot.city.resourceHistory.slice(-20)
        : [];

      return city;
    } catch (error) {
      console.error('Error al cargar ciudad:', error);
      return null;
    }
  }

  static loadConfig() {
    const snapshot = Persistence.loadCitySnapshot();
    return snapshot?.config ?? null;
  }

  static clearCity() {
    localStorage.removeItem(Persistence.CITY_KEY);
  }

  static exportCityJSON(city, options = {}) {
    try {
      const snapshot = Persistence.#buildSnapshot(city, options);
      const data = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download = Persistence.#buildExportFilename(city);
      a.click();

      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Error exportando ciudad:', error);
      return false;
    }
  }

  static async loadMapFromTXT(file, callback = null) {
    const loadedMap = await FileLoaderController.loadFromFile(file);

    Persistence.saveMapDefinition({
      fileName: loadedMap.fileName,
      width: loadedMap.metadata.width,
      height: loadedMap.metadata.height,
      stats: loadedMap.metadata.stats,
      grid: loadedMap.serializableGrid,
      content: loadedMap.content,
    });

    if (typeof callback === 'function') {
      callback(loadedMap.serializableGrid, loadedMap);
    }

    return loadedMap;
  }

  static saveMapDefinition(mapDefinition) {
    try {
      localStorage.setItem(Persistence.MAP_KEY, JSON.stringify(mapDefinition));
      return true;
    } catch (error) {
      console.error('Error al guardar mapa:', error);
      return false;
    }
  }

  static loadMapDefinition() {
    try {
      const mapJSON = localStorage.getItem(Persistence.MAP_KEY);
      if (!mapJSON) return null;
      return JSON.parse(mapJSON);
    } catch (error) {
      console.error('Error al cargar mapa:', error);
      return null;
    }
  }

  static saveRanking(ranking) {
    try {
      localStorage.setItem(Persistence.RANKING_KEY, JSON.stringify(ranking));
      return true;
    } catch (error) {
      console.error('Error al guardar ranking:', error);
      return false;
    }
  }

  static loadRanking() {
    try {
      const rankingJSON = localStorage.getItem(Persistence.RANKING_KEY);
      if (!rankingJSON) return [];

      const ranking = JSON.parse(rankingJSON);
      return Array.isArray(ranking) ? ranking : [];
    } catch (error) {
      console.error('Error al cargar ranking:', error);
      return [];
    }
  }

  static upsertRankingEntry(entry, { limit = 10 } = {}) {
    if (!entry || typeof entry !== 'object') {
      return Persistence.loadRanking();
    }

    const ranking = Persistence.loadRanking();

    const normalized = {
      ...entry,
      score: Number(entry.score ?? 0),
      turns: Number(entry.turns ?? 0),
      population: Number(entry.population ?? 0),
      happiness: Number(entry.happiness ?? 0),
      date: entry.date ?? new Date().toISOString(),
    };

    const filtered = ranking.filter((item) => !Persistence.#sameRankingEntry(item, normalized));
    filtered.push(normalized);

    filtered.sort((a, b) => {
      const byScore = Number(b.score ?? 0) - Number(a.score ?? 0);
      if (byScore !== 0) return byScore;

      const byTurns = Number(b.turns ?? 0) - Number(a.turns ?? 0);
      if (byTurns !== 0) return byTurns;

      return String(a.cityName ?? '').localeCompare(String(b.cityName ?? ''));
    });

    const limited = filtered.slice(0, limit);
    Persistence.saveRanking(limited);
    return limited;
  }

  static clearRanking() {
    localStorage.removeItem(Persistence.RANKING_KEY);
  }

  static #serializeConfig(config) {
    if (!config) return null;

    return {
      tickMs: Number(config.tickMs ?? 10000),
      autosaveMs: Number(config.autosaveMs ?? 30000),
      citizenConsumption: {
        electricity: Number(config.citizenConsumption?.electricity ?? 1),
        water: Number(config.citizenConsumption?.water ?? 1),
        food: Number(config.citizenConsumption?.food ?? 1),
      },
      happiness: {
        base: Number(config.happiness?.base ?? 50),
        bonusHasHome: Number(config.happiness?.bonusHasHome ?? 10),
        bonusHasJob: Number(config.happiness?.bonusHasJob ?? 10),
        growthThreshold: Number(config.happiness?.growthThreshold ?? 60),
        growthPerTurn: {
          min: Number(config.happiness?.growthPerTurn?.min ?? 1),
          max: Number(config.happiness?.growthPerTurn?.max ?? 3),
        },
      },
    };
  }

  static #buildSnapshot(city, options = {}) {
    const baseCity =
      typeof city?.toJSON === 'function' ? city.toJSON() : { ...(city ?? {}) };

    const serializableCity = {
      ...baseCity,
      gameOver: Boolean(city?.gameOver ?? baseCity.gameOver ?? false),
      gameOverReason:
        city?.motivoGameOver ??
        baseCity.gameOverReason ??
        baseCity.motivoGameOver ??
        null,
      resourceHistory: Array.isArray(city?.resourceHistory)
        ? city.resourceHistory.slice(-20)
        : Array.isArray(baseCity.resourceHistory)
          ? baseCity.resourceHistory.slice(-20)
          : [],
    };

    return {
      version: Persistence.SNAPSHOT_VERSION,
      savedAt: new Date().toISOString(),
      city: serializableCity,
      config: Persistence.#serializeConfig(options.config ?? null),
      gameState: options.gameState
        ? {
            status: options.gameState.status ?? 'stopped',
            createdAt: options.gameState.createdAt ?? null,
            lastTickAt: options.gameState.lastTickAt ?? null,
          }
        : null,
      mapDefinition: options.mapDefinition ?? Persistence.loadMapDefinition(),
      metadata: options.metadata ?? {},
    };
  }

  static #buildExportFilename(city) {
    const cityName =
      String(city?.nombreCiudad ?? city?.cityName ?? 'ciudad')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .toLowerCase() || 'ciudad';

    const now = new Date();
    const pad = (value) => String(value).padStart(2, '0');
    const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

    return `ciudad_${cityName}_${stamp}.json`;
  }

  static #sameRankingEntry(a, b) {
    return (
      String(a?.cityName ?? '') === String(b?.cityName ?? '') &&
      String(a?.mayor ?? '') === String(b?.mayor ?? '') &&
      Number(a?.score ?? 0) === Number(b?.score ?? 0) &&
      Number(a?.turns ?? 0) === Number(b?.turns ?? 0)
    );
  }
}

if (typeof window !== 'undefined') {
  window.Persistence = Persistence;
}