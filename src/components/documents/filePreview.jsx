import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ReactLoading from "react-loading";

// How each file type is shown:
//  - "tab":   the browser opens it natively (PDF viewer, images, video/audio) in a new tab.
//  - "text":  shown as plain text in a dialog (code, Gerber/drill files, configs, logs...).
//  - "sheet": Excel/CSV, parsed with SheetJS and shown as a table in a dialog.
//  - "word":  .docx, rendered with docx-preview inside a sandboxed frame.
// Anything else (PowerPoint, old .doc, CAD, archives) can only be downloaded.
// Never add html/svg/xml-with-xslt to "tab": they would run script in the app's origin.
const TAB_TYPES = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  webp: "image/webp",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

const TEXT_EXTENSIONS = new Set([
  "txt", "log", "md", "json", "xml", "yaml", "yml", "ini", "cfg", "conf", "properties",
  "html", "htm", "svg", "js", "ts", "css", "sql", "py", "cs", "c", "h", "cpp", "java", "bat", "ps1", "sh",
  // PCB fabrication / assembly outputs
  "gbr", "ger", "gtl", "gbl", "gts", "gbs", "gto", "gbo", "gtp", "gbp", "gko", "gm1", "gml",
  "drl", "xln", "nc", "ncd", "exc", "pos", "mnt", "pnp", "rpt", "bom", "ipc", "net",
]);

const SHEET_EXTENSIONS = new Set(["xlsx", "xlsm", "xls", "xlsb", "ods", "csv", "tsv"]);
const WORD_EXTENSIONS = new Set(["docx", "docm", "dotx"]);

// In-page previews parse the whole file in the browser; past this, download instead.
export const MAX_INLINE_PREVIEW_BYTES = 25 * 1024 * 1024;
const MAX_TEXT_CHARS = 2 * 1024 * 1024;
const MAX_SHEET_ROWS = 2000;
const MAX_SHEET_COLS = 100;

function extension(name) {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

export function previewKind(name) {
  const ext = extension(name);
  if (TAB_TYPES[ext]) return "tab";
  if (TEXT_EXTENSIONS.has(ext)) return "text";
  if (SHEET_EXTENSIONS.has(ext)) return "sheet";
  if (WORD_EXTENSIONS.has(ext)) return "word";
  return null;
}

export function tabType(name) {
  return TAB_TYPES[extension(name)];
}

// UTF-8 first; files saved by Russian-locale Windows tools are often cp1251.
export function decodeText(buffer) {
  const utf8 = new TextDecoder("utf-8").decode(buffer);
  const broken = (utf8.match(/�/g) || []).length;
  if (broken > 0 && broken > utf8.length / 1000) {
    try {
      return new TextDecoder("windows-1251").decode(buffer);
    } catch (ex) {}
  }
  return utf8;
}

function readBuffer(blob) {
  if (blob.arrayBuffer) return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
}

class FilePreview extends Component {
  state = { loading: true, error: null, text: null, truncated: false, sheets: null, sheetIndex: 0 };

  frameRef = React.createRef();

  componentDidMount() {
    this.load();
  }

  async load() {
    const { name, blob } = this.props;
    const kind = previewKind(name);
    try {
      const buffer = await readBuffer(blob);
      if (kind === "text") {
        const text = decodeText(buffer);
        this.setState({
          loading: false,
          text: text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text,
          truncated: text.length > MAX_TEXT_CHARS,
        });
      } else if (kind === "sheet") {
        this.setState({ loading: false, sheets: await this.parseSheets(name, buffer) });
      } else if (kind === "word") {
        // Rendered once the sandboxed frame has loaded (renderWord).
        this.buffer = buffer;
        this.setState({ loading: false });
      }
    } catch (ex) {
      this.setState({ loading: false, error: true });
    }
  }

  async parseSheets(name, buffer) {
    const XLSX = await import("xlsx");
    const ext = extension(name);
    const workbook =
      ext === "csv" || ext === "tsv"
        ? XLSX.read(decodeText(buffer), { type: "string" })
        : XLSX.read(buffer, { type: "array", cellDates: true });

    return workbook.SheetNames.map((sheetName) => {
      // raw:false -> values formatted the way Excel shows them (dates, percentages...).
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        raw: false,
        defval: "",
        blankrows: false,
      });
      const width = Math.min(
        MAX_SHEET_COLS,
        rows.reduce((max, row) => Math.max(max, row.length), 0)
      );
      return {
        name: sheetName,
        rows: rows.slice(0, MAX_SHEET_ROWS).map((row) => row.slice(0, width)),
        width,
        truncated: rows.length > MAX_SHEET_ROWS || rows.some((row) => row.length > MAX_SHEET_COLS),
      };
    });
  }

  // The frame is sandboxed without allow-scripts: links in a hostile .docx
  // (javascript:, etc.) cannot run. allow-same-origin lets us write into it.
  renderWord = async () => {
    const frame = this.frameRef.current;
    if (!frame || !this.buffer || this.wordRendered) return;
    this.wordRendered = true;
    try {
      const doc = frame.contentDocument;
      const { renderAsync } = await import("docx-preview");
      await renderAsync(this.buffer, doc.body, doc.head, {
        className: "docx",
        inWrapper: true,
        ignoreLastRenderedPageBreak: true,
      });
    } catch (ex) {
      this.setState({ error: true });
    }
  };

  renderSheet() {
    const { t } = this.props;
    const { sheets, sheetIndex } = this.state;
    if (!sheets || !sheets.length) return <div className="text-muted">{t("preview.emptySheet")}</div>;
    const sheet = sheets[sheetIndex];

    return (
      <div>
        {sheets.length > 1 && (
          <ul className="nav nav-tabs mb-2">
            {sheets.map((s, i) => (
              <li key={s.name} className="nav-item">
                <button
                  type="button"
                  className={"nav-link" + (i === sheetIndex ? " active" : "")}
                  onClick={() => this.setState({ sheetIndex: i })}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        {sheet.truncated && (
          <div className="alert alert-info py-1 small">
            {t("preview.sheetTruncated", { rows: MAX_SHEET_ROWS, cols: MAX_SHEET_COLS })}
          </div>
        )}
        {sheet.rows.length === 0 ? (
          <div className="text-muted">{t("preview.emptySheet")}</div>
        ) : (
          <div style={{ overflow: "auto", maxHeight: "70vh" }}>
            <table className="table table-sm table-bordered small mb-0" style={{ whiteSpace: "nowrap" }}>
              <tbody>
                {sheet.rows.map((row, r) => (
                  <tr key={r}>
                    <th className="table-light text-muted text-end">{r + 1}</th>
                    {Array.from({ length: sheet.width }, (_, c) => (
                      <td key={c}>{row[c]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  renderBody() {
    const { t, name } = this.props;
    const { loading, error, text, truncated } = this.state;
    const kind = previewKind(name);

    if (error) return <div className="alert alert-warning mb-0">{t("preview.failed")}</div>;
    if (loading) return <ReactLoading type="spin" color="blue" height={32} width={32} />;

    if (kind === "text")
      return (
        <>
          {truncated && <div className="alert alert-info py-1 small">{t("preview.textTruncated")}</div>}
          <pre className="mb-0 small" style={{ maxHeight: "70vh", overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {text}
          </pre>
        </>
      );

    if (kind === "sheet") return this.renderSheet();

    if (kind === "word")
      return (
        <iframe
          ref={this.frameRef}
          title={name}
          sandbox="allow-same-origin"
          srcDoc="<!doctype html><html><head><meta charset='utf-8'></head><body style='margin:0;background:#eee'></body></html>"
          onLoad={this.renderWord}
          style={{ width: "100%", height: "75vh", border: 0 }}
        />
      );

    return null;
  }

  render() {
    const { t, name, onClose, onDownload } = this.props;
    return (
      <Dialog open onClose={onClose} maxWidth="xl" fullWidth>
        <DialogTitle className="d-flex justify-content-between align-items-center gap-2">
          <span className="text-truncate">{name}</span>
          <span className="text-nowrap">
            <button type="button" className="btn btn-outline-primary btn-sm me-2" onClick={onDownload}>
              {t("download")}
            </button>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              {t("preview.close")}
            </button>
          </span>
        </DialogTitle>
        <DialogContent dividers>{this.renderBody()}</DialogContent>
      </Dialog>
    );
  }
}

export default withTranslation("documents")(FilePreview);
