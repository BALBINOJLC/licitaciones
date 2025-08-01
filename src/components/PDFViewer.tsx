import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Asegurarse de que el worker esté configurado (si no lo está en otro archivo)
// Resolver ruta del worker compatible con Vite
// @ts-ignore – Vite permitirá la importación de asset como URL
// eslint-disable-next-line import/no-webpack-loader-syntax
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

interface PDFViewerProps {
  /** Puede ser una URL (string) o un ArrayBuffer/Uint8Array con los bytes del PDF */
  file: string | ArrayBuffer | Uint8Array;
  /** Escala de renderizado de las páginas */
  scale?: number;
  /** Altura máxima del contenedor (para scroll) */
  maxHeight?: string | number;
}

/**
 * Componente sencillo que renderiza un PDF completo (todas sus páginas)
 * usando pdf.js y canvas. Ideal para previsualizar un PDF dentro de la app.
 */
const PDFViewer: React.FC<PDFViewerProps> = ({ file, scale = 1, maxHeight = "600px" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderPDF = async () => {
      try {
        setLoading(true);
        setError(null);
        // Limpiar contenedor
        if (containerRef.current) containerRef.current.innerHTML = "";

        const loadingTask = typeof file === "string" ? pdfjsLib.getDocument(file) : pdfjsLib.getDocument({ data: file });
        const pdf = await loadingTask.promise;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");
          if (!context) continue;
          await page.render({ canvasContext: context, viewport }).promise;
          containerRef.current?.appendChild(canvas);
        }
      } catch (err) {
        console.error("Error renderizando PDF", err);
        setError("No se pudo mostrar el PDF");
      } finally {
        setLoading(false);
      }
    };

    renderPDF();
  }, [file, scale]);

  return (
    <div
      style={{ maxHeight, overflow: "auto", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px" }}
    >
      {loading && <p className="text-sm text-gray-500">Cargando PDF...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div ref={containerRef} />
    </div>
  );
};

export default PDFViewer;
