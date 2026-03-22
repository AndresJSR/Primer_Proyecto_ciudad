// Runtime API configuration loaded before app bootstrap.
// Replace placeholder values with real keys for external data widgets.
(function () {
  const existing = globalThis.__CITY_BUILDER_API_CONFIG__ ?? {};

  globalThis.__CITY_BUILDER_API_CONFIG__ = {
    openWeatherApiKey: existing.openWeatherApiKey ?? 'TU_OPENWEATHER_API_KEY',
    newsApiKey: existing.newsApiKey ?? 'TU_NEWSAPI_API_KEY',
    newsCountry: existing.newsCountry ?? 'co',
  };
})();
