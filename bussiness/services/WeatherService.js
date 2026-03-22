import PublicApiConfig from '../core/PublicApiconfig.js';

export default class WeatherService {
  static async getCurrentWeather({ lat, lon }) {
    const apiKey = String(PublicApiConfig.openWeatherApiKey ?? '').trim();

    if (!apiKey) {
      throw new Error('Falta configurar openWeatherApiKey.');
    }

    const url = new URL(`${PublicApiConfig.openWeatherBaseUrl}/weather`);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lon));
    url.searchParams.set('appid', apiKey);
    url.searchParams.set('units', 'metric');
    url.searchParams.set('lang', 'es');

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`No se pudo consultar el clima (${response.status}).`);
    }

    const data = await response.json();

    return {
      main: data.weather?.[0]?.main ?? '',
      condition: data.weather?.[0]?.description ?? 'Sin descripción',
      temp: Math.round(Number(data.main?.temp ?? 0)),
      humidity: Math.round(Number(data.main?.humidity ?? 0)),
      windKmh: Math.round(Number(data.wind?.speed ?? 0) * 3.6),
      raw: data,
    };
  }
}