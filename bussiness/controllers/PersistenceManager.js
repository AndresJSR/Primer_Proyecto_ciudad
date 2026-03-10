/**
 * Clase encargada de manejar toda la persistencia del sistema.
 *
 * Funciones:
 * - Guardar estado de la ciudad (autosave)
 * - Cargar ciudad guardada rehidratando clases
 * - Exportar ciudad a JSON
 * - Importar mapa desde TXT
 * - Guardar y cargar ranking local
 */

import City from '../../models/City.js';
import FileLoaderController from '../../src/Business/Controllers/FileLoaderController.js';

export default class Persistence {
  static CITY_KEY = 'city_save';
  static RANKING_KEY = 'city_ranking';
  static MAP_KEY = 'city_last_map';

  static saveCity(city) {
    try {
      const serializableCity = typeof city?.toJSON === 'function' ? city.toJSON() : city;
      const cityJSON = JSON.stringify(serializableCity);

      localStorage.setItem(Persistence.CITY_KEY, cityJSON);
      console.log('Ciudad guardada correctamente');

      return true;
    } catch (error) {
      console.error('Error al guardar ciudad:', error);
      return false;
    }
  }

  static loadCity() {
    try {
      const cityJSON = localStorage.getItem(Persistence.CITY_KEY);
      if (!cityJSON) {
        console.log('No hay ciudad guardada');
        return null;
      }

      const raw = JSON.parse(cityJSON);
      return City.fromJSON(raw);
    } catch (error) {
      console.error('Error al cargar ciudad:', error);
      return null;
    }
  }

  static clearCity() {
    localStorage.removeItem(Persistence.CITY_KEY);
  }

  static exportCityJSON(city) {
    const serializableCity = typeof city?.toJSON === 'function' ? city.toJSON() : city;
    const data = JSON.stringify(serializableCity, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = 'city_export.json';
    a.click();

    URL.revokeObjectURL(url);
    console.log('Ciudad exportada como JSON');
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
      const rankingJSON = JSON.stringify(ranking);
      localStorage.setItem(Persistence.RANKING_KEY, rankingJSON);
      console.log('Ranking guardado');
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
      return JSON.parse(rankingJSON);
    } catch (error) {
      console.error('Error al cargar ranking:', error);
      return [];
    }
  }
}

if (typeof window !== 'undefined') {
  window.Persistence = Persistence;
}