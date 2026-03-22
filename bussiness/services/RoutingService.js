import { ApiService } from './APIService.js';

export default class RoutingService {
    static async calculateRoute({ map, origin, destination }) {
        if (!Array.isArray(map) || !origin || !destination) {
            throw new Error('RoutingService: se requiere map, origin y destination.');
        }

        return ApiService.request('/calculate-route', {
            method: 'POST',
            body: JSON.stringify({ map, origin, destination }),
        });
    }

}