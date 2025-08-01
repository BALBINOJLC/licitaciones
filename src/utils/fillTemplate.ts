import { PDFDocument } from "pdf-lib";
import type { ProposalData } from "../components/ProposalGenerator";

export async function fillTemplate(templateBytes: Uint8Array, data: ProposalData) {
  const pdfDoc = await PDFDocument.load(templateBytes);
  const form = pdfDoc.getForm();

  // Project info
  form.getTextField("project_name").setText(data.projectInfo.name);
  form.getTextField("client").setText(data.projectInfo.client);
  form.getTextField("date").setText(data.projectInfo.date);
  form.getTextField("total_cost").setText(String(data.projectInfo.totalCost));
  form.getTextField("timeline").setText(data.projectInfo.timeline);

  data.sections.forEach((s, idx) => {
    const i = idx + 1;
    if (form.hasField(`section_${i}_title`)) {
      form.getTextField(`section_${i}_title`).setText(s.title);
    }
    if (form.hasField(`section_${i}_content`)) {
      const text = Array.isArray(s.content) ? s.content.join("\n") : String(s.content);
      form.getTextField(`section_${i}_content`).setText(text);
    }
  });

  return await pdfDoc.save();
}
