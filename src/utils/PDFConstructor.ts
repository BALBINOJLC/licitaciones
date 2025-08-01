import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface PDFTextOptions {
  x?: number;
  y?: number;
  size?: number;
  color?: {
    r: number;
    g: number;
    b: number;
  };
  maxWidth?: number;
  font?: "TimesRoman" | "Helvetica" | "Courier";
}

export interface PDFImageOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

/**
 * Clase simple para construir archivos PDF de forma declarativa.
 * Oculta la complejidad de pdf-lib y expone un API amigable en español.
 *
 * Ejemplo de uso:
 * ```ts
 * const pdf = await PDFConstructor.crear();
 * pdf.nuevaPagina();
 * pdf.agregarTexto("Hola mundo", { x: 50, y: 700 });
 * await pdf.guardarComo("ejemplo.pdf");
 * ```
 */
export class PDFConstructor {
  private pdfDoc: PDFDocument;
  private currentPageIndex = 0;

  private constructor(pdfDoc: PDFDocument) {
    this.pdfDoc = pdfDoc;
  }

  /**
   * Crea una nueva instancia de PDFConstructor.
   */
  static async crear(): Promise<PDFConstructor> {
    const doc = await PDFDocument.create();
    // Crea la primera página por defecto
    doc.addPage();
    return new PDFConstructor(doc);
  }

  /**
   * Agrega una nueva página y la selecciona como actual.
   */
  nuevaPagina(width = 595.28, height = 841.89 /* A4 en puntos */) {
    this.pdfDoc.addPage([width, height]);
    this.currentPageIndex = this.pdfDoc.getPageCount() - 1;
  }

  /**
   * Selecciona la página actual por índice (0-based).
   */
  irAPagina(index: number) {
    if (index >= 0 && index < this.pdfDoc.getPageCount()) {
      this.currentPageIndex = index;
    } else {
      throw new Error("Índice de página fuera de rango");
    }
  }

  /**
   * Agrega un texto a la página actual.
   */
  async agregarTexto(texto: string, options: PDFTextOptions = {}) {
    const page = this.pdfDoc.getPage(this.currentPageIndex);
    const {
      x = 50,
      y = 750,
      size = 12,
      color = { r: 0, g: 0, b: 0 },
      maxWidth,
      font = "Helvetica",
    } = options;

    const fontRef = await this.obtenerFuente(font);

    page.drawText(texto, {
      x,
      y,
      size,
      font: fontRef,
      color: rgb(color.r, color.g, color.b),
      maxWidth,
    });
  }

  /**
   * Agrega una imagen (PNG o JPG) a la página actual.
   */
  async agregarImagen(imgBytes: Uint8Array, options: PDFImageOptions = {}) {
    const page = this.pdfDoc.getPage(this.currentPageIndex);
    const { x = 50, y = 400, width, height } = options;

    let img;
    const mime = this.detectMime(imgBytes);
    if (mime === "image/png") {
      img = await this.pdfDoc.embedPng(imgBytes);
    } else if (mime === "image/jpeg") {
      img = await this.pdfDoc.embedJpg(imgBytes);
    } else {
      throw new Error("Formato de imagen no soportado (solo PNG o JPG)");
    }

    const imgDims = img.scale(1);
    const finalWidth = width ?? imgDims.width;
    const finalHeight = height ?? imgDims.height;

    page.drawImage(img, {
      x,
      y,
      width: finalWidth,
      height: finalHeight,
    });
  }

  /**
   * Devuelve los bytes del PDF listo.
   */
  async obtenerBytes(): Promise<Uint8Array> {
    return await this.pdfDoc.save();
  }

  /**
   * Descarga el PDF en el navegador.
   */
  async guardarComo(nombreArchivo: string) {
    const bytes = await this.obtenerBytes();
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Utilidades internas -----------------------

  private async obtenerFuente(font: "TimesRoman" | "Helvetica" | "Courier") {
    switch (font) {
      case "TimesRoman":
        return await this.pdfDoc.embedFont(StandardFonts.TimesRoman);
      case "Courier":
        return await this.pdfDoc.embedFont(StandardFonts.Courier);
      default:
        return await this.pdfDoc.embedFont(StandardFonts.Helvetica);
    }
  }

  private detectMime(bytes: Uint8Array): string {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    ) {
      return "image/png";
    }
    // JPG: FF D8 FF
    if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      return "image/jpeg";
    }
    return "";
  }
}