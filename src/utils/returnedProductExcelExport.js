import ExcelJS from "exceljs";
import { format } from "date-fns";

const THIN = { style: "thin", color: { argb: "FF000000" } };
const BORDER_ALL = { top: THIN, left: THIN, bottom: THIN, right: THIN };

function borderRange(ws, r1, c1, r2, c2, border = BORDER_ALL) {
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      ws.getCell(r, c).border = border;
    }
  }
}

function groupBoards(scannedBoards, missingLabel) {
  const groups = new Map();
  scannedBoards.forEach((b) => {
    const key = `${b.modelId ?? "missing"}|${b.serialCode}|${b.sapCode}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count += b.count;
      return;
    }
    groups.set(key, {
      modelName: b.missing ? missingLabel : b.modelName,
      serialCode: b.serialCode || missingLabel,
      sapCode: b.sapCode || missingLabel,
      count: b.count,
    });
  });
  return Array.from(groups.values());
}

export async function exportScannedBoardsToExcel(scannedBoards, destinationLabel, t) {
  const ex = (key) => t(`returnProduct:export.excel.${key}`);
  const rows = groupBoards(scannedBoards, ex("missingLabel"));

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet(ex("sheetName"));

  ws.columns = [
    { width: 30 },
    { width: 16 },
    { width: 20 },
    { width: 10 },
    { width: 10 },
  ];

  let r = 1;

  ws.mergeCells(r, 1, r, 5);
  const titleCell = ws.getCell(r, 1);
  titleCell.value = ex("title");
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(r).height = 26;
  r++;

  ws.mergeCells(r, 1, r, 5);
  const subtitleCell = ws.getCell(r, 1);
  subtitleCell.value = ex("subtitle");
  subtitleCell.font = { bold: true, size: 14 };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(r).height = 22;
  r++;

  const headerRow = r;
  [ex("columns.model"), ex("columns.serialCode"), ex("columns.sapCode"), ex("columns.count")].forEach(
    (h, i) => {
      const cell = ws.getCell(headerRow, i + 1);
      cell.value = h;
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFEFEF" } };
    }
  );
  r++;

  rows.forEach((row) => {
    ws.getCell(r, 1).value = row.modelName;
    ws.getCell(r, 2).value = row.serialCode;
    ws.getCell(r, 3).value = row.sapCode;
    ws.getCell(r, 4).value = row.count;
    ws.getCell(r, 4).alignment = { horizontal: "center" };
    ws.getCell(r, 5).value = ex("unit");
    r++;
  });
  const lastDataRow = r - 1;
  borderRange(ws, headerRow, 1, Math.max(lastDataRow, headerRow), 4);

  r++;

  ws.mergeCells(r, 1, r, 5);
  const destinationCell = ws.getCell(r, 1);
  destinationCell.value = destinationLabel;
  destinationCell.font = { bold: true, size: 18, color: { argb: "FFFF0000" } };
  destinationCell.alignment = { horizontal: "center", vertical: "middle" };
  ws.getRow(r).height = 26;
  r++;

  const stampRow = r;
  ws.getRow(stampRow).height = 70;

  ws.mergeCells(stampRow, 1, stampRow, 2);
  const esdCell = ws.getCell(stampRow, 1);
  esdCell.value = ex("esdText");
  esdCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF00" } };
  esdCell.font = { bold: true, size: 9, color: { argb: "FF000000" } };
  esdCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  borderRange(ws, stampRow, 1, stampRow, 2);

  const codeCell = ws.getCell(stampRow, 3);
  codeCell.value = `${ex("footerCode")}\n${format(new Date(), "M/d/yyyy")}`;
  codeCell.font = { bold: true, size: 14 };
  codeCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

  ws.mergeCells(stampRow, 4, stampRow, 5);
  const fragileCell = ws.getCell(stampRow, 4);
  fragileCell.value = ex("fragileText");
  fragileCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF0000" } };
  fragileCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  fragileCell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  borderRange(ws, stampRow, 4, stampRow, 5);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${ex("title")}_${format(new Date(), "yyyy-MM-dd_HHmm")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
