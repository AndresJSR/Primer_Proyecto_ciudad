class RoutingService {

    static async getRouting(origin, destination) {

        return await ApiService.request(
            `/routes?origin=${origin}&destination=${destination}`
        );

    }

}