import { PDFDocument, StandardFonts } from "pdf-lib";

export interface TemplateOptions {
  maxSections?: number;
}

// Genera un PDF con campos de formulario editables que servirá como plantilla.
export async function createEditableTemplate(opts: TemplateOptions = {}) {
  const maxSections = opts.maxSections ?? 10;
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();

  // Página principal -----------------------------------------------------
  const first = doc.addPage([595, 842]); // A4 portrait en puntos
  first.drawText("Propuesta de Desarrollo", { x: 50, y: 780, size: 20, font });

  // Campos básicos del proyecto
  form.createTextField("project_name").setText("")
    .addToPage(first, { x: 50, y: 730, width: 400, height: 18 });

  form.createTextField("client").setText("")
    .addToPage(first, { x: 50, y: 700, width: 400, height: 18 });

  form.createTextField("date").setText("")
    .addToPage(first, { x: 50, y: 670, width: 150, height: 18 });

  form.createTextField("total_cost").setText("")
    .addToPage(first, { x: 220, y: 670, width: 130, height: 18 });

  form.createTextField("timeline")
    .enableMultiline()
    .setText("")
    .addToPage(first, { x: 50, y: 600, width: 495, height: 60 });

  // Secciones -----------------------------------------------------------
  for (let i = 1; i <= maxSections; i++) {
    const p = doc.addPage([595, 842]);
    p.drawText(`Sección ${i}`, { x: 50, y: 780, size: 18, font });

    form.createTextField(`section_${i}_title`).setText("")
      .addToPage(p, { x: 50, y: 740, width: 495, height: 18 });

    form.createTextField(`section_${i}_content`)
      .enableMultiline()
      .setText("")
      .addToPage(p, { x: 50, y: 680, width: 495, height: 500 });
  }

  return await doc.save();
}
