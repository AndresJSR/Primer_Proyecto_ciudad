const BUILDING_CODES = {
  R1: 'residential',
  R2: 'residential',
  C1: 'commercial',
  C2: 'commercial',
  I1: 'industrial',
  I2: 'industrial',
  S1: 'service',
  S2: 'service',
  S3: 'service',
  U1: 'utility',
  U2: 'utility',
  P1: 'park',
};

function normalizeToken(token) {
  return String(token ?? '').trim().toUpperCase();
}

function parseCell(token, x, y) {
  const raw = String(token ?? '').trim();
  const normalized = normalizeToken(raw);

  if (!raw) {
    return {
      x,
      y,
      raw,
      token: '',
      valid: false,
      error: `Celda vacía en (${x}, ${y})`,
      type: 'invalid',
      code: null,
      category: null,
    };
  }

  if (normalized === 'G') {
    return {
      x,
      y,
      raw,
      token: 'g',
      valid: true,
      type: 'grass',
      code: null,
      category: null,
    };
  }

  if (normalized === 'R') {
    return {
      x,
      y,
      raw,
      token: 'r',
      valid: true,
      type: 'road',
      code: null,
      category: null,
    };
  }

  if (BUILDING_CODES[normalized]) {
    return {
      x,
      y,
      raw,
      token: normalized,
      valid: true,
      type: 'building',
      code: normalized,
      category: BUILDING_CODES[normalized],
    };
  }

  return {
    x,
    y,
    raw,
    token: raw,
    valid: false,
    error: `Token inválido "${raw}" en (${x}, ${y})`,
    type: 'invalid',
    code: null,
    category: null,
  };
}

export default class MapValidator {
  static validateText(text) {
    const normalizedText = String(text ?? '')
      .replace(/^\uFEFF/, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();

    if (!normalizedText) {
      throw new Error('Mapa inválido: El archivo está vacío o no contiene filas válidas.');
    }

    const lines = normalizedText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      throw new Error('Mapa inválido: El archivo está vacío o no contiene filas válidas.');
    }

    const rows = lines.map((line) => line.split(/\s+/).filter(Boolean));

    const width = rows[0].length;
    const height = rows.length;

    if (width === 0) {
      throw new Error('Mapa inválido: No se encontraron columnas válidas.');
    }

    const errors = [];
    const cells = [];

    for (let y = 0; y < rows.length; y++) {
      const row = rows[y];

      if (row.length !== width) {
        errors.push(
          `Fila ${y + 1} inválida: tiene ${row.length} columnas y se esperaban ${width}.`,
        );
      }

      const parsedRow = [];

      for (let x = 0; x < row.length; x++) {
        const parsed = parseCell(row[x], x, y);

        if (!parsed.valid && parsed.error) {
          errors.push(parsed.error);
        }

        parsedRow.push(parsed);
      }

      cells.push(parsedRow);
    }

    const flatCells = cells.flat();

    const stats = {
      total: flatCells.length,
      grass: flatCells.filter((c) => c.type === 'grass').length,
      road: flatCells.filter((c) => c.type === 'road').length,
      building: flatCells.filter((c) => c.type === 'building').length,
      buildingsByCode: flatCells.reduce((acc, cell) => {
        if (cell.code) {
          acc[cell.code] = (acc[cell.code] ?? 0) + 1;
        }
        return acc;
      }, {}),
    };

    return {
      valid: errors.length === 0,
      errors,
      warnings: [],
      width,
      height,
      rows,
      cells,
      stats,
    };
  }
}