import PublicApiConfig from '../core/PublicApiconfig.js';

export default class ApiColombiaService {
  static async getCities() {
    const response = await fetch(`${PublicApiConfig.apiColombiaBaseUrl}/City`);

    if (!response.ok) {
      throw new Error(`No se pudieron cargar las ciudades de Colombia (${response.status}).`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('La respuesta de API Colombia no tiene el formato esperado.');
    }

    return data
      .map((city) => {
        const airport = Array.isArray(city.airports) ? city.airports[0] : null;
        const attraction = Array.isArray(city.touristAttractions) ? city.touristAttractions[0] : null;

        const lat = Number(
          airport?.latitude ??
          attraction?.latitude ??
          NaN,
        );

        const lon = Number(
          airport?.longitude ??
          attraction?.longitude ??
          NaN,
        );

        return {
          id: city.id,
          name: city.name,
          departmentName: city.department?.name ?? 'Colombia',
          lat: Number.isFinite(lat) ? lat : null,
          lon: Number.isFinite(lon) ? lon : null,
          raw: city,
        };
      })
      .filter((city) => city.name)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
}