import MapValidator from '../../../utils/MapValidator.js';

export default class FileLoaderController {
  static async loadFromFile(file, options = {}) {
    if (!(file instanceof File)) {
      throw new Error('Debes seleccionar un archivo válido.');
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (extension !== 'txt') {
      throw new Error('Solo se permiten archivos .txt para cargar mapas.');
    }

    const content = await this.readFileAsText(file);

    return this.loadFromText(content, {
      ...options,
      fileName: file.name,
      fileSize: file.size,
    });
  }

  static async loadFromProject(path, options = {}) {
    if (typeof path !== 'string' || path.trim() === '') {
      throw new Error('Debes indicar una ruta válida para el mapa.');
    }

    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`No se pudo cargar el archivo del proyecto: ${path}`);
    }

    const content = await response.text();

    return this.loadFromText(content, {
      ...options,
      fileName: path.split('/').pop() ?? 'mapa.txt',
      fileSize: content.length,
    });
  }

  static loadFromText(text, options = {}) {
    const parsed = MapValidator.validateText(
      text,
      options.validationOptions ?? {}
    );

    return {
      fileName: options.fileName ?? 'mapa.txt',
      fileSize: options.fileSize ?? null,
      content: text,
      parsed,
      metadata: {
        width: parsed.width,
        height: parsed.height,
        stats: parsed.stats,
        warnings: parsed.warnings,
      },
      serializableGrid: MapValidator.toSerializableGrid(parsed),
    };
  }

  static readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve(String(event.target?.result ?? ''));
      };

      reader.onerror = () => {
        reject(new Error(`No se pudo leer el archivo '${file.name}'.`));
      };

      reader.readAsText(file);
    });
  }
}

if (typeof window !== 'undefined') {
  window.FileLoaderController = FileLoaderController;
}