import PublicApiConfig from '../core/PublicApiconfig.js';

export default class NewsService {
  static async getTopHeadlines({ query = '', pageSize = 5 } = {}) {
    const apiKey = String(PublicApiConfig.newsApiKey ?? '').trim();

    if (!apiKey) {
      throw new Error('Falta configurar newsApiKey.');
    }

    const normalizedQuery = String(query ?? '')
      .replace(/\./g, '')
      .trim();

    const primaryUrl = new URL(`${PublicApiConfig.newsApiBaseUrl}/top-headlines`);
    primaryUrl.searchParams.set('apiKey', apiKey);
    primaryUrl.searchParams.set('country', PublicApiConfig.newsCountry || 'co');
    primaryUrl.searchParams.set('pageSize', String(pageSize));

    if (normalizedQuery) {
      primaryUrl.searchParams.set('q', normalizedQuery);
    }

    const primaryResponse = await fetch(primaryUrl.toString());

    if (!primaryResponse.ok) {
      throw new Error(`No se pudieron consultar noticias (${primaryResponse.status}).`);
    }

    const primaryData = await primaryResponse.json();

    if (Array.isArray(primaryData.articles) && primaryData.articles.length > 0) {
      return primaryData.articles.map((article) => ({
        title: article.title ?? 'Sin título',
        description: article.description ?? 'Sin descripción',
        sourceName: article.source?.name ?? 'Fuente desconocida',
        articleUrl: article.url ?? '',
        imageUrl: article.urlToImage ?? '',
        publishedAt: article.publishedAt ?? '',
        raw: article,
      }));
    }

    const fallbackUrl = new URL(`${PublicApiConfig.newsApiBaseUrl}/top-headlines`);
    fallbackUrl.searchParams.set('apiKey', apiKey);
    fallbackUrl.searchParams.set('country', PublicApiConfig.newsCountry || 'co');
    fallbackUrl.searchParams.set('pageSize', String(pageSize));

    const fallbackResponse = await fetch(fallbackUrl.toString());

    if (!fallbackResponse.ok) {
      throw new Error(`No se pudieron consultar noticias (${fallbackResponse.status}).`);
    }

    const fallbackData = await fallbackResponse.json();

    return Array.isArray(fallbackData.articles)
      ? fallbackData.articles.map((article) => ({
          title: article.title ?? 'Sin título',
          description: article.description ?? 'Sin descripción',
          sourceName: article.source?.name ?? 'Fuente desconocida',
          articleUrl: article.url ?? '',
          imageUrl: article.urlToImage ?? '',
          publishedAt: article.publishedAt ?? '',
          raw: article,
        }))
      : [];
  }
}