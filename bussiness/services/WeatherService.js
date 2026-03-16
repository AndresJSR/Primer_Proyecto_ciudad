import PublicApiConfig from '../../config/PublicApiConfig.js';

export default class OpenWeatherService {
  static async getCurrentWeather({ lat, lon }) {
    if (!PublicApiConfig.openWeatherApiKey) {
      throw new Error('Falta configurar la API key de OpenWeather.');
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      throw new Error('No hay coordenadas válidas para consultar el clima.');
    }

    const url = new URL(`${PublicApiConfig.openWeatherBaseUrl}/weather`);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('appid', PublicApiConfig.openWeatherApiKey);
    url.searchParams.set('units', 'metric');
    url.searchParams.set('lang', 'es');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`No se pudo obtener el clima (${response.status}).`);
    }

    const data = await response.json();

    return {
      temp: Math.round(Number(data.main?.temp ?? 0)),
      condition: data.weather?.[0]?.description ?? 'Sin descripción',
      humidity: Number(data.main?.humidity ?? 0),
      windKmh: Math.round(Number(data.wind?.speed ?? 0) * 3.6),
      iconCode: data.weather?.[0]?.icon ?? '',
      main: data.weather?.[0]?.main ?? '',
    };
  }
}