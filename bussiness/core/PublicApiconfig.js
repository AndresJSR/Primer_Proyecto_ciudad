const runtimeConfig = globalThis.__CITY_BUILDER_API_CONFIG__ ?? {};

const PublicApiConfig = {
  apiColombiaBaseUrl: 'https://api-colombia.com/api/v1',
  openWeatherBaseUrl: 'https://api.openweathermap.org/data/2.5',
  newsApiBaseUrl: 'https://newsapi.org/v2',

  openWeatherApiKey: runtimeConfig.openWeatherApiKey ?? '',
  newsApiKey: runtimeConfig.newsApiKey ?? '',
  newsCountry: runtimeConfig.newsCountry ?? 'co',

  cacheTtlMs: 30 * 60 * 1000,
};

export default PublicApiConfig;