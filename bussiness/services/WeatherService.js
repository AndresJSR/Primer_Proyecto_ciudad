class WeatherService {

    static async getWeather(city) {

        return await ApiService.request(`/weather?city=${city}`);

    }

}