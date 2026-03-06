export class ApiService {

    static BASE_URL = "http://localhost:3000/api";

    // activar modo mock
    static MOCK_MODE = true;


    static async request(endpoint, options = {}) {

        if (this.MOCK_MODE) {
            return this.mockResponse(endpoint);
        }

        try {

            const response = await fetch(`${this.BASE_URL}${endpoint}`, {
                headers: {
                    "Content-Type": "application/json"
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            return await response.json();

        } catch (error) {

            console.error("API Error:", error);
            return null;

        }
    }


    /**
     * Simulación de respuestas del backend
     */
    static mockResponse(endpoint) {

        console.log("MOCK API:", endpoint);

        if (endpoint.startsWith("/weather")) {

            return {
                city: "Pereira",
                temperature: 24,
                condition: "Cloudy"
            };

        }

        if (endpoint.startsWith("/news")) {

            return [
                {
                    title: "Nueva carretera construida",
                    date: "2026-03-06"
                },
                {
                    title: "Parque central renovado",
                    date: "2026-03-05"
                }
            ];

        }

        if (endpoint.startsWith("/routes")) {

            return {
                origin: "A",
                destination: "B",
                distance: "4 km",
                time: "10 minutes"
            };

        }

        return null;
    }

}