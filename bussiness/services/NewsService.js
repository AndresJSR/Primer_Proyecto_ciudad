class NewsService {

    static async getNews() {

        return await ApiService.request(`/news`);

    }

}