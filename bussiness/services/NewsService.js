import PublicApiConfig from '../../config/PublicApiConfig.js';

export default class NewsApiService {
  static async getTopHeadlines({ query = '', pageSize = 5 } = {}) {
    if (!PublicApiConfig.newsApiKey) {
      throw new Error('Falta configurar la API key de NewsAPI.');
    }

    const url = new URL(`${PublicApiConfig.newsApiBaseUrl}/top-headlines`);
    url.searchParams.set('country', PublicApiConfig.newsCountry);
    url.searchParams.set('pageSize', String(pageSize));

    if (query && query.trim()) {
      url.searchParams.set('q', query.trim());
    }

    const response = await fetch(url.toString(), {
      headers: {
        'X-Api-Key': PublicApiConfig.newsApiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`No se pudieron obtener noticias (${response.status}).`);
    }

    const data = await response.json();

    if (!Array.isArray(data.articles)) {
      throw new Error('La respuesta de NewsAPI no contiene artículos válidos.');
    }

    return data.articles.slice(0, pageSize).map((article) => ({
      title: article.title ?? 'Sin título',
      description: article.description ?? 'Sin descripción disponible.',
      imageUrl: article.urlToImage ?? '',
      articleUrl: article.url ?? '',
      sourceName: article.source?.name ?? 'Fuente desconocida',
      publishedAt: article.publishedAt ?? null,
    }));
  }
}