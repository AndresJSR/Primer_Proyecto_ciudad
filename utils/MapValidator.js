const DEFAULT_ALLOWED_CODES = [
  'R1', 'R2',
  'C1', 'C2',
  'I1', 'I2',
  'U1', 'U2',
  'S1', 'S2', 'S3',
  'P1',
];

export default class MapValidator {
  static MIN_SIZE = 15;
  static MAX_SIZE = 30;
  static GRASS_TOKEN = 'g';
  static ROAD_TOKEN = 'r';
  static ALLOWED_BUILDING_CODES = new Set(DEFAULT_ALLOWED_CODES);

  static validateText(text, options = {}) {
    const parsed = this.parse(text, options);

    if (!parsed.valid) {
      const detail = parsed.errors.join(' | ');
      throw new Error(`Mapa inválido: ${detail}`);
    }

    return parsed;
  }

  static parse(text, options = {}) {
    const {
      minSize = this.MIN_SIZE,
      maxSize = this.MAX_SIZE,
      allowComments = true,
    } = options;

    const errors = [];
    const warnings = [];

    if (typeof text !== 'string') {
      return {
        valid: false,
        errors: ['El contenido del mapa debe ser texto.'],
        warnings,
        width: 0,
        height: 0,
        rows: [],
        cells: [],
        stats: this.#emptyStats(),
      };
    }

    const normalizedLines = text
      .replace(/\uFEFF/g, '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .filter((line) => !(allowComments && line.startsWith('#')));

    if (normalizedLines.length === 0) {
      return {
        valid: false,
        errors: ['El archivo está vacío o no contiene filas válidas.'],
        warnings,
        width: 0,
        height: 0,
        rows: [],
        cells: [],
        stats: this.#emptyStats(),
      };
    }

    const rows = normalizedLines.map((line) => line.split(/\s+/).filter(Boolean));
    const width = rows[0]?.length ?? 0;
    const height = rows.length;

    if (width < minSize || width > maxSize) {
      errors.push(`El ancho del mapa debe estar entre ${minSize} y ${maxSize}. Se recibió ${width}.`);
    }

    if (height < minSize || height > maxSize) {
      errors.push(`El alto del mapa debe estar entre ${minSize} y ${maxSize}. Se recibió ${height}.`);
    }

    rows.forEach((row, rowIndex) => {
      if (row.length !== width) {
        errors.push(
          `La fila ${rowIndex + 1} tiene ${row.length} columnas y se esperaban ${width}.`,
        );
      }
    });

    const stats = this.#emptyStats();

    const cells = rows.map((row, y) =>
      row.map((rawToken, x) => {
        const token = this.normalizeToken(rawToken);
        const descriptor = this.describeToken(token);

        if (!descriptor.valid) {
          errors.push(`Token inválido '${rawToken}' en fila ${y + 1}, columna ${x + 1}.`);
        } else {
          stats.total += 1;
          stats[descriptor.type] += 1;

          if (descriptor.type === 'building') {
            stats.buildingsByCode[descriptor.code] = (stats.buildingsByCode[descriptor.code] ?? 0) + 1;
          }
        }

        return {
          x,
          y,
          raw: rawToken,
          token,
          ...descriptor,
        };
      }),
    );

    if (stats.road === 0) {
      warnings.push('El mapa no contiene vías (r).');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      width,
      height,
      rows,
      cells,
      stats,
    };
  }

  static normalizeToken(token) {
    if (typeof token !== 'string') return '';

    const trimmed = token.trim();
    if (!trimmed) return '';

    const lower = trimmed.toLowerCase();
    if (lower === this.GRASS_TOKEN || lower === this.ROAD_TOKEN) {
      return lower;
    }

    return trimmed.toUpperCase();
  }

  static describeToken(token) {
    if (token === this.GRASS_TOKEN) {
      return {
        valid: true,
        type: 'grass',
        code: null,
        category: null,
      };
    }

    if (token === this.ROAD_TOKEN) {
      return {
        valid: true,
        type: 'road',
        code: null,
        category: null,
      };
    }

    if (this.ALLOWED_BUILDING_CODES.has(token)) {
      return {
        valid: true,
        type: 'building',
        code: token,
        category: this.getBuildingCategory(token),
      };
    }

    return {
      valid: false,
      type: 'unknown',
      code: token || null,
      category: null,
    };
  }

  static getBuildingCategory(code) {
    if (typeof code !== 'string' || code.length === 0) return null;

    switch (code[0].toUpperCase()) {
      case 'R': return 'residential';
      case 'C': return 'commercial';
      case 'I': return 'industrial';
      case 'U': return 'utility';
      case 'S': return 'service';
      case 'P': return 'park';
      default: return null;
    }
  }

  static toSerializableGrid(parsedMap) {
    const parsed = parsedMap?.cells ? parsedMap : this.validateText(parsedMap);

    return parsed.cells.map((row) =>
      row.map((cell) => ({
        token: cell.token,
        type: cell.type,
        code: cell.code,
        category: cell.category,
      })),
    );
  }

  static #emptyStats() {
    return {
      total: 0,
      grass: 0,
      road: 0,
      building: 0,
      buildingsByCode: {},
    };
  }
}

if (typeof window !== 'undefined') {
  window.MapValidator = MapValidator;
}