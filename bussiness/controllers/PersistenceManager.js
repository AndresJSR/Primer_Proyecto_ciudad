/**
 * Clase encargada de manejar toda la persistencia del sistema.
 * 
 * Funciones:
 * - Guardar estado de la ciudad (autosave)
 * - Cargar ciudad guardada
 * - Exportar ciudad a JSON
 * - Importar mapa desde TXT
 * - Guardar y cargar ranking local
 */

class Persistence {

    // Claves utilizadas dentro del localStorage
    static CITY_KEY = "city_save";
    static RANKING_KEY = "city_ranking";


    /**
     * Guarda automáticamente la ciudad en localStorage
     * (cumple HU-020 Autosave)
     */
    static saveCity(city) {

        try {

            const cityJSON = JSON.stringify(city);

            localStorage.setItem(Persistence.CITY_KEY, cityJSON);

            console.log("Ciudad guardada correctamente");

        } catch (error) {

            console.error("Error al guardar ciudad:", error);

        }
    }


    /**
     * Carga la ciudad desde localStorage
     */
    static loadCity() {

        try {

            const cityJSON = localStorage.getItem(Persistence.CITY_KEY);

            if (!cityJSON) {

                console.log("No hay ciudad guardada");
                return null;

            }

            return JSON.parse(cityJSON);

        } catch (error) {

            console.error("Error al cargar ciudad:", error);
            return null;

        }
    }


    /**
     * Exporta la ciudad a un archivo JSON descargable
     * (cumple HU-021)
     */
    static exportCityJSON(city) {

        const data = JSON.stringify(city, null, 2);

        const blob = new Blob([data], { type: "application/json" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = "city_export.json";

        a.click();

        URL.revokeObjectURL(url);

        console.log("Ciudad exportada como JSON");
    }


    /**
     * Importa un mapa desde un archivo TXT
     * (cumple HU-002)
     */
    static loadMapFromTXT(file, callback) {

        const reader = new FileReader();

        reader.onload = function (event) {

            const text = event.target.result;

            const rows = text.trim().split("\n");

            const map = rows.map(row => row.trim().split(" "));

            callback(map);
        };

        reader.readAsText(file);
    }


    /**
     * Guarda el ranking local en localStorage
     * (cumple HU-019)
     */
    static saveRanking(ranking) {

        try {

            const rankingJSON = JSON.stringify(ranking);

            localStorage.setItem(Persistence.RANKING_KEY, rankingJSON);

            console.log("Ranking guardado");

        } catch (error) {

            console.error("Error al guardar ranking:", error);

        }
    }


    /**
     * Carga el ranking desde localStorage
     */
    static loadRanking() {

        try {

            const rankingJSON = localStorage.getItem(Persistence.RANKING_KEY);

            if (!rankingJSON) return [];

            return JSON.parse(rankingJSON);

        } catch (error) {

            console.error("Error al cargar ranking:", error);

            return [];

        }
    }

}