import MapValidator from '../../../utils/MapValidator.js';

export default class FileLoaderController {
  static async loadFromFile(file) {
    if (!file) {
      throw new Error('No se seleccionó ningún archivo.');
    }

    const text = await file.text();

    return this.loadFromText(text, {
      fileName: file.name ?? 'mapa.txt',
      fileSize: file.size ?? 0,
    });
  }

  static async loadFromProject(path) {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo del proyecto: ${path}`);
    }

    const text = await response.text();

    return this.loadFromText(text, {
      fileName: path.split('/').pop() ?? 'mapa.txt',
      fileSize: new Blob([text]).size,
    });
  }

  static loadFromText(text, { fileName = 'mapa.txt', fileSize = 0 } = {}) {
    const normalizedText = this.normalizeText(text);

    if (!normalizedText.trim()) {
      throw new Error('Mapa inválido: El archivo está vacío o no contiene filas válidas.');
    }

    let parsed;

    try {
      parsed = MapValidator.validateText(normalizedText);
    } catch (error) {
      throw new Error(error.message || 'Mapa inválido.');
    }

    if (!parsed?.valid) {
      const msg = parsed?.errors?.length
        ? parsed.errors.join(' | ')
        : 'Mapa inválido.';
      throw new Error(msg);
    }

    return {
      fileName,
      fileSize,
      content: normalizedText,
      parsed,
      metadata: {
        width: parsed.width,
        height: parsed.height,
        stats: parsed.stats,
      },
      serializableGrid: this.toSerializableGrid(parsed),
    };
  }

  static normalizeText(text) {
    return String(text ?? '')
      .replace(/^\uFEFF/, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim();
  }

  static toSerializableGrid(parsed) {
    return parsed.cells.map((row) => row.map((cell) => cell.token));
  }
}