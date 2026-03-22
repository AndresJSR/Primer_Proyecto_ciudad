import PublicApiConfig from '../../../bussiness/core/PublicApiconfig.js';
import OpenWeatherService from '../../../bussiness/services/WeatherService.js';
import NewsApiService from '../../../bussiness/services/NewsService.js';

export default class ExternalDataController {
  constructor({ getCityContext }) {
    this.getCityContext = getCityContext;
    this.intervalId = null;

    this.weatherWidget = document.getElementById('weather-widget');
    this.newsPanel = document.getElementById('news-panel');
  }

  init() {
    this.refreshAll();
    this.startAutoRefresh();
  }

  destroy() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  startAutoRefresh() {
    this.destroy();
    this.intervalId = window.setInterval(() => {
      this.refreshAll();
    }, PublicApiConfig.cacheTtlMs);
  }

  async refreshAll() {
    const city = this.getCityContext?.();
    if (!city) return;

    await Promise.allSettled([
      this.refreshWeather(city),
      this.refreshNews(city),
    ]);
  }

  async refreshWeather(city) {
    if (!this.weatherWidget) return;

    this.#setWidgetState(this.weatherWidget, 'loading');

    try {
      const cacheKey = `weather:${city.name}:${city.lat}:${city.lon}`;
      const cached = this.#getCache(cacheKey);

      const weather = cached ?? await OpenWeatherService.getCurrentWeather({
        lat: city.lat,
        lon: city.lon,
      });

      if (!cached) {
        this.#setCache(cacheKey, weather);
      }

      this.weatherWidget.querySelector('.weather-temp').textContent = `${weather.temp}°C`;
      this.weatherWidget.querySelector('.weather-condition').textContent = weather.condition;
      this.weatherWidget.querySelector('.weather-humidity').textContent = `Humedad: ${weather.humidity}%`;
      this.weatherWidget.querySelector('.weather-wind').textContent = `Viento: ${weather.windKmh} km/h`;

      const iconEl = this.weatherWidget.querySelector('.weather-icon');
      iconEl.textContent = this.#resolveWeatherEmoji(weather.main);

      this.#setWidgetState(this.weatherWidget, 'ready');
    } catch (error) {
      console.error('Error consultando clima:', error);
      this.weatherWidget.querySelector('.widget-error .error-message').textContent =
        error.message || 'No se pudo obtener el clima.';
      this.#setWidgetState(this.weatherWidget, 'error');
    }
  }

  async refreshNews(city) {
    if (!this.newsPanel) return;

    this.#setWidgetState(this.newsPanel, 'loading');

    try {
      const query = city.departmentName || city.name || '';
      const cacheKey = `news:${PublicApiConfig.newsCountry}:${query}`;
      const cached = this.#getCache(cacheKey);

      const articles = cached ?? await NewsApiService.getTopHeadlines({
        query,
        pageSize: 5,
      });

      if (!cached) {
        this.#setCache(cacheKey, articles);
      }

      const listEl = this.newsPanel.querySelector('.news-list');

      if (!articles.length) {
        listEl.innerHTML = `
          <article class="news-item">
            <h4 class="news-title">Sin noticias disponibles</h4>
            <p class="news-description">No se encontraron noticias para esta región.</p>
          </article>
        `;
      } else {
        listEl.innerHTML = articles.map((article) => `
          <article class="news-item">
            ${article.imageUrl ? `<img class="news-image" src="${article.imageUrl}" alt="${this.#escapeHtml(article.title)}">` : ''}
            <h4 class="news-title">${this.#escapeHtml(article.title)}</h4>
            <p class="news-description">${this.#escapeHtml(article.description)}</p>
            <div class="news-meta">${this.#escapeHtml(article.sourceName)}</div>
            ${article.articleUrl ? `<a class="news-link" href="${article.articleUrl}" target="_blank" rel="noopener noreferrer">Leer más</a>` : ''}
          </article>
        `).join('');
      }

      this.#setWidgetState(this.newsPanel, 'ready');
    } catch (error) {
      console.error('Error consultando noticias:', error);
      this.newsPanel.querySelector('.widget-error .error-message').textContent =
        error.message || 'No se pudieron obtener noticias.';
      this.#setWidgetState(this.newsPanel, 'error');
    }
  }

  #setWidgetState(widgetEl, state) {
    const content = widgetEl.querySelector('.widget-content');
    const loading = widgetEl.querySelector('.widget-loading');
    const error = widgetEl.querySelector('.widget-error');

    if (!content || !loading || !error) return;

    if (state === 'loading') {
      content.style.display = 'none';
      loading.style.display = 'block';
      error.style.display = 'none';
      return;
    }

    if (state === 'error') {
      content.style.display = 'none';
      loading.style.display = 'none';
      error.style.display = 'block';
      return;
    }

    content.style.display = '';
    loading.style.display = 'none';
    error.style.display = 'none';
  }

  #resolveWeatherEmoji(main) {
    const normalized = String(main ?? '').toLowerCase();

    if (normalized.includes('clear')) return '☀️';
    if (normalized.includes('cloud')) return '☁️';
    if (normalized.includes('rain')) return '🌧️';
    if (normalized.includes('drizzle')) return '🌦️';
    if (normalized.includes('thunder')) return '⛈️';
    if (normalized.includes('snow')) return '❄️';
    if (normalized.includes('mist') || normalized.includes('fog')) return '🌫️';

    return '🌤️';
  }

  #setCache(key, value) {
    localStorage.setItem(key, JSON.stringify({
      savedAt: Date.now(),
      value,
    }));
  }

  #getCache(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw);

      if (!parsed?.savedAt || (Date.now() - parsed.savedAt) > PublicApiConfig.cacheTtlMs) {
        return null;
      }

      return parsed.value;
    } catch {
      return null;
    }
  }

  #escapeHtml(text) {
    return String(text ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }
}