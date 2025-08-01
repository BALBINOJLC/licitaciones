import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { PDFDocument, rgb } from "pdf-lib";
// Vite-friendly worker import
// @ts-ignore
import workerSrc from "pdfjs-dist/build/pdf.worker.min.js?url";

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

interface Rect {
  x: number; // PDF coords
  y: number;
  width: number;
  height: number;
}

interface RedactorProps {
  file: ArrayBuffer | Uint8Array;
  onFinish: (redactedBytes: Uint8Array) => void;
}

const PDFRedactor: React.FC<RedactorProps> = ({ file, onFinish }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageViewports, setPageViewports] = useState<any[]>([]);
  const [rectsByPage, setRectsByPage] = useState<Record<number, Rect[]>>({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPageIdx, setCurrentPageIdx] = useState<number | null>(null);

  // RENDER PAGES -----------------------------------------------------------
  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";
      const loadingTask = pdfjsLib.getDocument({ data: file });
      const pdf = await loadingTask.promise;
      const viewports: any[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.2 });
        viewports.push(viewport);

        const wrapper = document.createElement("div");
        wrapper.style.position = "relative";
        wrapper.style.marginBottom = "16px";

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const overlay = document.createElement("canvas");
        overlay.width = viewport.width;
        overlay.height = viewport.height;
        overlay.style.position = "absolute";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.cursor = "crosshair";

        overlay.addEventListener("mousedown", (e) => {
          setIsDrawing(true);
          setStartPoint({ x: e.offsetX, y: e.offsetY });
          setCurrentPageIdx(pageNum - 1);
        });
        overlay.addEventListener("mousemove", (e) => {
          if (!isDrawing || currentPageIdx !== pageNum - 1) return;
          const ctxOv = overlay.getContext("2d");
          if (!ctxOv || !startPoint) return;
          ctxOv.clearRect(0, 0, overlay.width, overlay.height);
          ctxOv.strokeStyle = "rgba(255,0,0,0.8)";
          ctxOv.lineWidth = 1;
          ctxOv.setLineDash([4]);
          const w = e.offsetX - startPoint.x;
          const h = e.offsetY - startPoint.y;
          ctxOv.strokeRect(startPoint.x, startPoint.y, w, h);
        });
        overlay.addEventListener("mouseup", (e) => {
          if (!isDrawing || currentPageIdx !== pageNum - 1 || !startPoint) return;
          setIsDrawing(false);
          const rect = {
            x1: startPoint.x,
            y1: startPoint.y,
            x2: e.offsetX,
            y2: e.offsetY,
          };
          const x = Math.min(rect.x1, rect.x2);
          const y = Math.min(rect.y1, rect.y2);
          const w = Math.abs(rect.x2 - rect.x1);
          const h = Math.abs(rect.y2 - rect.y1);

          // convertir a coords PDF
          const pdfX = x / 1.2;
          const pdfY = (overlay.height - y - h) / 1.2;
          const pdfW = w / 1.2;
          const pdfH = h / 1.2;

          setRectsByPage((prev) => {
            const arr = [...(prev[pageNum - 1] || []), { x: pdfX, y: pdfY, width: pdfW, height: pdfH }];
            return { ...prev, [pageNum - 1]: arr };
          });
          // limpiar overlay
          const ctxOv = overlay.getContext("2d");
          if (ctxOv) ctxOv.clearRect(0, 0, overlay.width, overlay.height);
        });

        wrapper.appendChild(canvas);
        wrapper.appendChild(overlay);
        containerRef.current.appendChild(wrapper);
      }

      setPageViewports(viewports);
    };
    render();
  }, [file]);

  // APPLY REDACTION -------------------------------------------------------
  const handleApply = async () => {
    const pdfDoc = await PDFDocument.load(file instanceof Uint8Array ? file : new Uint8Array(file));
    Object.entries(rectsByPage).forEach(([idx, rects]) => {
      const page = pdfDoc.getPage(Number(idx));
      rects.forEach((r) => {
        page.drawRectangle({ x: r.x, y: r.y, width: r.width, height: r.height, color: rgb(1, 1, 1) });
      });
    });
    const bytes = await pdfDoc.save();
    onFinish(bytes);
  };

  return (
    <div>
      <div
        ref={containerRef}
        style={{ maxHeight: "65vh", overflow: "auto", border: "1px solid #d1d5db", padding: "8px" }}
      />
      <button
        onClick={handleApply}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        disabled={Object.keys(rectsByPage).length === 0}
      >
        Aplicar eliminación y descargar
      </button>
    </div>
  );
};

export default PDFRedactor;
