export class ApiService {
  static BASE_URL = "http://localhost:3000/api";

  // activar modo mock
  static MOCK_MODE = true;

  static async request(endpoint, options = {}) {
    if (this.MOCK_MODE) {
      return this.mockResponse(endpoint, options);
    }

    try {
      const response = await fetch(`${this.BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
        },
        ...options,
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
  static mockResponse(endpoint, options = {}) {
    console.log("MOCK API:", endpoint);

    if (endpoint.startsWith("/weather")) {
      return {
        city: "Pereira",
        temperature: 24,
        condition: "Cloudy",
      };
    }

    if (endpoint.startsWith("/news")) {
      return [
        {
          title: "Nueva carretera construida",
          date: "2026-03-06",
        },
        {
          title: "Parque central renovado",
          date: "2026-03-05",
        },
      ];
    }

    if (endpoint.startsWith("/routes")) {
      return {
        origin: "A",
        destination: "B",
        distance: "4 km",
        time: "10 minutes",
      };
    }

    if (endpoint === "/calculate-route") {
      const method = String(options.method ?? "GET").toUpperCase();
      if (method !== "POST") {
        return { route: [], message: "Método inválido para calcular ruta." };
      }

      try {
        const payload = JSON.parse(options.body ?? "{}");
        const route = this.computeMockRoute(payload);

        if (!route.length) {
          return {
            route: [],
            message: "No hay ruta disponible entre estos edificios.",
          };
        }

        return { route };
      } catch (error) {
        console.error("MOCK Route Error:", error);
        return { route: [], message: "No se pudo calcular la ruta." };
      }
    }

    return null;
  }

  static computeMockRoute({ map, origin, destination } = {}) {
    if (!Array.isArray(map) || !origin || !destination) return [];

    const height = map.length;
    const width = height > 0 ? map[0].length : 0;
    if (height === 0 || width === 0) return [];

    const dirs = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;
    const key = (x, y) => `${x},${y}`;

    const findAdjacentRoads = ({ x, y }) => {
      const roads = [];
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (inBounds(nx, ny) && Number(map[ny][nx]) === 1) {
          roads.push({ x: nx, y: ny });
        }
      }
      return roads;
    };

    const originRoads = findAdjacentRoads(origin);
    const destinationRoads = findAdjacentRoads(destination);

    if (!originRoads.length || !destinationRoads.length) {
      return [];
    }

    const queue = originRoads.map((cell) => ({ ...cell }));
    const visited = new Set(queue.map((cell) => key(cell.x, cell.y)));
    const parent = new Map();
    const destinationSet = new Set(
      destinationRoads.map((cell) => key(cell.x, cell.y)),
    );

    let reached = null;
    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = key(current.x, current.y);

      if (destinationSet.has(currentKey)) {
        reached = current;
        break;
      }

      for (const [dx, dy] of dirs) {
        const nx = current.x + dx;
        const ny = current.y + dy;
        const nextKey = key(nx, ny);

        if (
          !inBounds(nx, ny) ||
          Number(map[ny][nx]) !== 1 ||
          visited.has(nextKey)
        ) {
          continue;
        }

        visited.add(nextKey);
        parent.set(nextKey, currentKey);
        queue.push({ x: nx, y: ny });
      }
    }

    if (!reached) {
      return [];
    }

    const roadPath = [];
    let cursorKey = key(reached.x, reached.y);
    while (cursorKey) {
      const [x, y] = cursorKey.split(",").map(Number);
      roadPath.push({ x, y });
      cursorKey = parent.get(cursorKey) ?? null;
    }
    roadPath.reverse();

    return [origin, ...roadPath, destination];
  }
}
