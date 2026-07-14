import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDate } from "@/utils/format";

export interface PdfReportOptions {
  title: string;
  subtitle: string;
  summary: { label: string; value: number }[];
  columns: string[];
  rows: (string | number)[][];
  filename: string;
}

export function downloadReportPdf({ title, subtitle, summary, columns, rows, filename }: PdfReportOptions) {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(subtitle, 14, 25);
  doc.text(`Generated ${formatDate(new Date(), { dateStyle: "medium" })}`, 14, 30);

  doc.setTextColor(0);
  doc.setFontSize(11);
  let summaryY = 40;
  summary.forEach((item) => {
    doc.text(`${item.label}: ${formatCurrency(item.value)}`, 14, summaryY);
    summaryY += 6;
  });

  autoTable(doc, {
    startY: summaryY + 4,
    head: [columns],
    body: rows,
    headStyles: { fillColor: [0, 113, 227] },
    styles: { fontSize: 9 },
  });

  doc.save(filename);
}
