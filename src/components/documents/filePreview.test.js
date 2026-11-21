import React from "react";
import { render, screen } from "@testing-library/react";
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from "util";
import * as XLSX from "xlsx";
import "../../i18n/i18n";
import i18n from "../../i18n/i18n";
import FilePreview, { previewKind, decodeText } from "./filePreview";

// jsdom has no TextDecoder; Node's supports utf-8 and windows-1251 (full ICU).
if (!global.TextDecoder) global.TextDecoder = NodeTextDecoder;
if (!global.TextEncoder) global.TextEncoder = NodeTextEncoder;

const show = (name, blob) =>
  render(<FilePreview name={name} blob={blob} onClose={() => {}} onDownload={() => {}} />);

beforeEach(() => i18n.changeLanguage("en"));

test("picks a viewer per file type", () => {
  expect(previewKind("datasheet.PDF")).toBe("tab");
  expect(previewKind("photo.jpg")).toBe("tab");
  expect(previewKind("BOM.xlsx")).toBe("sheet");
  expect(previewKind("pick.csv")).toBe("sheet");
  expect(previewKind("work-instruction.docx")).toBe("word");
  expect(previewKind("top.gtl")).toBe("text");
  expect(previewKind("drill.drl")).toBe("text");
  // Would run script inside the app if opened in a tab - shown as text instead.
  expect(previewKind("page.html")).toBe("text");
  expect(previewKind("logo.svg")).toBe("text");
  // No browser viewer.
  expect(previewKind("slides.pptx")).toBeNull();
  expect(previewKind("board.dwg")).toBeNull();
  expect(previewKind("gerbers.zip")).toBeNull();
  expect(previewKind("README")).toBeNull();
});

test("decodes cp1251 text when it isn't UTF-8", () => {
  // "Плата" in windows-1251
  const cp1251 = new Uint8Array([0xcf, 0xeb, 0xe0, 0xf2, 0xe0]);
  expect(decodeText(cp1251.buffer)).toBe("Плата");
  expect(decodeText(new TextEncoder().encode("Плата").buffer)).toBe("Плата");
});

test("shows text files as text, without interpreting markup", async () => {
  show("page.html", new Blob(["<b>bold</b><script>alert(1)</script>"]));

  expect(await screen.findByText("<b>bold</b><script>alert(1)</script>")).toBeInTheDocument();
});

test("shows an Excel workbook as a table, one tab per sheet", async () => {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Ref", "Part"], ["R1", "RC0402-10K"]]), "BOM");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["X", "Y"]]), "Placement");
  const bytes = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

  show("bom.xlsx", new Blob([bytes]));

  expect(await screen.findByText("RC0402-10K")).toBeInTheDocument();
  expect(screen.getByText("Ref")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Placement" })).toBeInTheDocument();
});

test("shows CSV as a table", async () => {
  show("pick.csv", new Blob(["Designator,X,Y\nC12,10.5,22.1\n"]));

  expect(await screen.findByText("C12")).toBeInTheDocument();
  expect(screen.getByText("22.1")).toBeInTheDocument();
});

test("renders Word files in a sandboxed frame that cannot run scripts", async () => {
  const { baseElement } = show("wi.docx", new Blob(["not really a docx"]));

  const frame = await screen.findByTitle("wi.docx");
  expect(frame.tagName).toBe("IFRAME");
  expect(frame.getAttribute("sandbox")).toBe("allow-same-origin");
  expect(baseElement).toBeTruthy();
});
