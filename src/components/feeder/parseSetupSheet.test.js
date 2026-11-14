import { parseSetupSheet } from "./parseSetupSheet";

describe("parseSetupSheet", () => {
  it("reads the legacy layout: header row then Module, Feeder, Code", () => {
    const { rows, headerDetected } = parseSetupSheet([
      ["Module", "Feeder", "Code"],
      ["M1", 1, "RC0402-10K"],
      ["M1", "02", " C0001 "],
    ]);

    expect(headerDetected).toBe(true);
    expect(rows).toEqual([
      { rowNumber: 2, module: "M1", feeder: "1", code: "RC0402-10K" },
      { rowNumber: 3, module: "M1", feeder: "02", code: "C0001" },
    ]);
  });

  it("finds a localized header below a title row, in any column order", () => {
    const { rows, headerDetected } = parseSetupSheet([
      ["MB-55 top side"],
      [],
      ["Код", "№", "Модуль", "Фидер"],
      ["R0001", 1, "M2", 7],
    ]);

    expect(headerDetected).toBe(true);
    expect(rows).toEqual([{ rowNumber: 4, module: "M2", feeder: "7", code: "R0001" }]);
  });

  it("falls back to columns A-C when no header is recognized, skipping blank rows", () => {
    const { rows, headerDetected } = parseSetupSheet([
      ["Modul raqami", "Joy", "Detal kodi"],
      ["M1", 3, "D0001"],
      [null, "", undefined],
    ]);

    expect(headerDetected).toBe(false);
    expect(rows).toEqual([{ rowNumber: 2, module: "M1", feeder: "3", code: "D0001" }]);
  });
});
