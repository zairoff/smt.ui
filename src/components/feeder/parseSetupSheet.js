// Turns the operator's feeder-list sheet into import rows. The legacy model-changer
// read columns 1-3 (Module, Feeder, Code) from row 2 on; operators' files sometimes
// have a title row or the columns in another order, so look for a header row first.
const HEADER_ALIASES = {
  module: ["module", "modul", "модуль", "mod", "table", "stol", "стол"],
  feeder: ["feeder", "fider", "фидер", "slot", "слот", "feederno", "fiderno"],
  code: ["code", "kod", "код", "partnumber", "partno", "pn", "rcode", "detal", "деталь", "component", "komponent", "компонент"],
};

const MAX_HEADER_SCAN_ROWS = 10;

const normalizeHeader = (value) =>
  String(value == null ? "" : value)
    .toLowerCase()
    .replace(/[\s._\-#№]/g, "");

const cellText = (value) => (value == null ? "" : String(value).trim());

function findHeader(rows) {
  const limit = Math.min(rows.length, MAX_HEADER_SCAN_ROWS);

  for (let rowIndex = 0; rowIndex < limit; rowIndex++) {
    const columns = {};
    (rows[rowIndex] || []).forEach((cell, columnIndex) => {
      const header = normalizeHeader(cell);
      Object.keys(HEADER_ALIASES).forEach((key) => {
        if (columns[key] === undefined && HEADER_ALIASES[key].includes(header))
          columns[key] = columnIndex;
      });
    });

    if (Object.keys(HEADER_ALIASES).every((key) => columns[key] !== undefined))
      return { rowIndex, columns, detected: true };
  }

  // Legacy layout: header in the first row, columns A-C.
  return { rowIndex: 0, columns: { module: 0, feeder: 1, code: 2 }, detected: false };
}

// sheetRows: array of arrays, e.g. XLSX.utils.sheet_to_json(sheet, { header: 1 }).
// rowNumber is the Excel row number, so preview errors point at the right line.
export function parseSetupSheet(sheetRows) {
  const rows = sheetRows || [];
  const { rowIndex, columns, detected } = findHeader(rows);

  const result = [];
  for (let i = rowIndex + 1; i < rows.length; i++) {
    const cells = rows[i] || [];
    const row = {
      rowNumber: i + 1,
      module: cellText(cells[columns.module]),
      feeder: cellText(cells[columns.feeder]),
      code: cellText(cells[columns.code]),
    };

    if (row.module || row.feeder || row.code) result.push(row);
  }

  return { rows: result, headerDetected: detected };
}
