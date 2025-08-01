import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Section } from "../components/ProposalGenerator";

export interface ProposalInfo {
  name: string;
  client: string;
  date: string;
  totalCost: number;
  timeline: string;
}

export interface ProposalData {
  projectInfo: ProposalInfo;
  sections: Section[];
}

interface Cursor {
  x: number;
  y: number;
}

const PAGE_WIDTH = 595.28; // A4 points
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 40;
const MARGIN_Y_TOP = 40;
const MARGIN_Y_BOTTOM = 40;

export async function buildProposalPDF(data: ProposalData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const cursor: Cursor = { x: MARGIN_X, y: PAGE_HEIGHT - MARGIN_Y_TOP };

  const advanceY = (dy: number) => {
    cursor.y -= dy;
    if (cursor.y < MARGIN_Y_BOTTOM) {
      // Nueva página
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursor.y = PAGE_HEIGHT - MARGIN_Y_TOP;
    }
  };

  // Header
  page.drawText("GUX", {
    x: cursor.x,
    y: cursor.y,
    size: 24,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  advanceY(32);
  page.drawText("Propuesta de Desarrollo", {
    x: cursor.x,
    y: cursor.y,
    size: 14,
    font: fontRegular,
    color: rgb(0.2, 0.2, 0.2),
  });
  advanceY(32);

  // Project Info (solo primera página)
  drawLabelValue(page, cursor, "Proyecto", data.projectInfo.name, fontBold, fontRegular);
  drawLabelValue(page, cursor, "Cliente", data.projectInfo.client, fontBold, fontRegular);
  drawLabelValue(page, cursor, "Fecha", data.projectInfo.date, fontBold, fontRegular);
  drawLabelValue(
    page,
    cursor,
    "Costo Total",
    `$${data.projectInfo.totalCost.toLocaleString()}`,
    fontBold,
    fontRegular
  );
  advanceY(24);

  // Sections
  data.sections.forEach((section) => {
    page.drawText(section.title, {
      x: cursor.x,
      y: cursor.y,
      size: 16,
      font: fontBold,
      color: rgb(0, 0.2, 0.6),
    });
    advanceY(20);

    switch (section.type) {
      case "text":
        drawParagraph(page, cursor, section.content as string, fontRegular);
        break;
      case "list":
        drawList(page, cursor, section.content as string[], fontRegular);
        break;
      case "table":
        drawTable(page, cursor, section.content, fontRegular, fontBold);
        break;
      default:
        drawParagraph(page, cursor, "Tipo de sección no soportado", fontRegular);
    }

    if (section.pageBreak) {
      // forzar nueva página
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      cursor.y = PAGE_HEIGHT - MARGIN_Y_TOP;
    } else {
      advanceY(24);
    }
  });

  // Footer (última página)
  if (cursor.y - 40 < MARGIN_Y_BOTTOM) {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    cursor.y = PAGE_HEIGHT - MARGIN_Y_TOP;
  }
  page.drawText(
    "Equipo GUX - Especialistas en Desarrollo de Software | contacto@gux.com | +1 (555) 123-4567",
    {
      x: MARGIN_X,
      y: MARGIN_Y_BOTTOM,
      size: 10,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    }
  );

  return await doc.save();
}

// ------------ helpers ------------
function drawLabelValue(
  page: any,
  cursor: Cursor,
  label: string,
  value: string,
  fontLabel: any,
  fontValue: any
) {
  const labelText = `${label}: `;
  page.drawText(labelText, {
    x: cursor.x,
    y: cursor.y,
    size: 12,
    font: fontLabel,
  });
  const labelWidth = fontLabel.widthOfTextAtSize(labelText, 12);
  page.drawText(value, {
    x: cursor.x + labelWidth,
    y: cursor.y,
    size: 12,
    font: fontValue,
  });
  cursor.y -= 18;
}

function drawParagraph(page: any, cursor: Cursor, text: string, font: any) {
  const maxWidth = PAGE_WIDTH - 2 * MARGIN_X;
  const words = text.split(/\s+/);
  let line = "";
  const lineHeight = 14;
  words.forEach((word) => {
    const testLine = line + word + " ";
    const width = font.widthOfTextAtSize(testLine, 12);
    if (width > maxWidth) {
      page.drawText(line.trimEnd(), {
        x: cursor.x,
        y: cursor.y,
        size: 12,
        font,
      });
      cursor.y -= lineHeight;
      line = word + " ";
    } else {
      line = testLine;
    }
  });
  if (line) {
    page.drawText(line.trimEnd(), {
      x: cursor.x,
      y: cursor.y,
      size: 12,
      font,
    });
    cursor.y -= lineHeight;
  }
}

function drawList(page: any, cursor: Cursor, items: string[], font: any) {
  items.forEach((item) => {
    page.drawText("• " + item, {
      x: cursor.x,
      y: cursor.y,
      size: 12,
      font,
    });
    cursor.y -= 14;
  });
}

function drawTable(page: any, cursor: Cursor, table: any, font: any, fontBold: any) {
  const { headers, rows } = table;
  const lineHeight = 14;
  const colWidth = (PAGE_WIDTH - 2 * MARGIN_X) / headers.length;

  // headers
  headers.forEach((h: string, idx: number) => {
    page.drawText(h, {
      x: cursor.x + idx * colWidth,
      y: cursor.y,
      size: 12,
      font: fontBold,
    });
  });
  cursor.y -= lineHeight;

  rows.forEach((row: string[]) => {
    row.forEach((cell, idx) => {
      page.drawText(String(cell), {
        x: cursor.x + idx * colWidth,
        y: cursor.y,
        size: 10,
        font,
      });
    });
    cursor.y -= lineHeight;
  });
}