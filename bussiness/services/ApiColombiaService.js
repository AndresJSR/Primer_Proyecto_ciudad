import PublicApiConfig from '../core/PublicApiconfig.js';

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function pickCoordinates(city) {
  const airport = Array.isArray(city.airports) ? city.airports[0] : null;
  const attraction = Array.isArray(city.touristAttractions) ? city.touristAttractions[0] : null;

  const lat =
    toFiniteNumber(airport?.latitude) ??
    toFiniteNumber(airport?.lat) ??
    toFiniteNumber(attraction?.latitude) ??
    toFiniteNumber(attraction?.lat) ??
    null;

  const lon =
    toFiniteNumber(airport?.longitude) ??
    toFiniteNumber(airport?.lon) ??
    toFiniteNumber(attraction?.longitude) ??
    toFiniteNumber(attraction?.lon) ??
    null;

  return { lat, lon };
}

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
        const coords = pickCoordinates(city);

        return {
          id: city.id ?? null,
          name: city.name ?? 'Sin nombre',
          departmentName: city.department?.name ?? 'Colombia',
          lat: coords.lat,
          lon: coords.lon,
          raw: city,
        };
      })
      .filter((city) => city.name && city.name !== 'Sin nombre')
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
}