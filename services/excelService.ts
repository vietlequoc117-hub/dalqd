
import XLSX from 'xlsx-js-style';
import { ExamData, SubjectConfig } from '../types';

export const exportToExcel = (data: ExamData[], config: SubjectConfig, originalFilename?: string) => {
  if (!XLSX || !XLSX.utils) return;

  const wb = XLSX.utils.book_new();
  const ws: any = {};

  const borderStyle = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } }
  };

  const baseStyle = {
    font: { name: "Times New Roman", sz: 11 },
    alignment: { vertical: "center", horizontal: "center" },
    border: borderStyle
  };

  const headerStyle = { ...baseStyle, font: { ...baseStyle.font, bold: true } };
  const p1Style = { ...headerStyle, fill: { fgColor: { rgb: "FFF2CC" } } };
  const p2Style = { ...headerStyle, fill: { fgColor: { rgb: "E2EFDA" } } };
  const p3Style = { ...headerStyle, fill: { fgColor: { rgb: "C6E0B4" } } };

  const setCell = (r: number, c: number, value: any, style: any = baseStyle) => {
    const cellRef = XLSX.utils.encode_cell({ r, c });
    ws[cellRef] = { v: value, s: style, t: typeof value === 'number' ? 'n' : 's' };
  };

  // Row 1: Header (Exam codes)
  setCell(0, 0, "Câu\\Mã đề", p1Style);
  data.forEach((exam, idx) => setCell(0, idx + 1, exam.examCode, headerStyle));

  let currentRow = 1;

  // Part I
  for (let i = 0; i < config.p1Count; i++) {
    setCell(currentRow, 0, i + 1, p1Style);
    data.forEach((exam, idx) => setCell(currentRow, idx + 1, exam.part1[i] || "", baseStyle));
    currentRow++;
  }

  // Part II
  for (let i = 0; i < config.p2Count; i++) {
    setCell(currentRow, 0, i + 1, p2Style);
    data.forEach((exam, idx) => setCell(currentRow, idx + 1, exam.part2[i] || "", baseStyle));
    currentRow++;
  }

  // Part III
  for (let i = 0; i < config.p3Count; i++) {
    setCell(currentRow, 0, i + 1, p3Style);
    data.forEach((exam, idx) => setCell(currentRow, idx + 1, exam.part3[i] || "", baseStyle));
    currentRow++;
  }

  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: currentRow - 1, c: data.length } });
  ws['!cols'] = [{ wch: 15 }, ...data.map(() => ({ wch: 10 }))];

  XLSX.utils.book_append_sheet(wb, ws, "Dap An");
  
  let exportName = `HD_${config.id}.xlsx`;
  if (originalFilename) {
    const baseName = originalFilename.replace(/\.[^/.]+$/, "");
    exportName = `HD_${baseName}.xlsx`;
  }
  
  XLSX.writeFile(wb, exportName);
};
