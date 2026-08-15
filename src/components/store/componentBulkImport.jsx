import React from "react";
import ReactLoading from "react-loading";
import { withTranslation } from "react-i18next";
import Form from "../forms/form";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { addComponents } from "../../services/componentService";
import ComponentBulkImportResultTable from "../tables/componentBulkImportResultTable";

const REQUIRED_COLUMNS = [
  "PartNumber",
  "RCode",
  "StorePlaceNumber",
  "SapPlace",
  "PlaceCode",
  "Specification",
];

class ComponentBulkImport extends Form {
  fileInputRef = React.createRef();

  state = {
    results: [],
    loading: false,
  };

  _handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    this.setState({ loading: true, results: [] });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        toast.error(this.props.t("componentBulkImport.emptyFile"));
        return;
      }

      const rows = jsonData.map((item) =>
        REQUIRED_COLUMNS.reduce((row, column) => {
          row[column] = item[column] !== undefined ? String(item[column]) : "";
          return row;
        }, {})
      );

      const { data: results } = await addComponents(rows);
      const rowsWithId = results.map((result) => ({ ...result, id: result.row }));

      this.setState({ results: rowsWithId });

      const failed = rowsWithId.filter((r) => r.status === "Failed").length;
      if (failed > 0) {
        toast.warning(
          this.props.t("componentBulkImport.summary", {
            total: rowsWithId.length,
            success: rowsWithId.length - failed,
            failed,
          })
        );
      } else {
        toast.success(
          this.props.t("componentBulkImport.summary", {
            total: rowsWithId.length,
            success: rowsWithId.length,
            failed: 0,
          })
        );
      }
    } catch (ex) {
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
      if (this.fileInputRef.current) this.fileInputRef.current.value = "";
    }
  };

  render() {
    const { results, loading } = this.state;
    const { t } = this.props;

    const total = results.length;
    const failed = results.filter((r) => r.status === "Failed").length;
    const success = total - failed;

    return (
      <div className="row">
        <div className="col">
          <p className="mt-2">{t("componentBulkImport.hint")}</p>
          <input
            ref={this.fileInputRef}
            accept=".xlsx,.xls"
            onInput={this._handleFile}
            type="file"
            disabled={loading}
          />

          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}

          {!loading && total > 0 && (
            <div className="mt-3 mb-2">
              <span className="badge bg-secondary me-2">
                {t("componentBulkImport.total", { count: total })}
              </span>
              <span className="badge bg-success me-2">
                {t("componentBulkImport.success", { count: success })}
              </span>
              <span className="badge bg-danger">
                {t("componentBulkImport.failed", { count: failed })}
              </span>
            </div>
          )}

          <div className="mt-2">
            <ComponentBulkImportResultTable rows={results} loading={loading} />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation(["store", "common"])(ComponentBulkImport);
