import React from "react";
import { useTranslation } from "react-i18next";
import TableBody from "./tableBody";
import TableHeader from "./tableHeader";

const Table = ({
  columns,
  rows,
  sortColumn,
  onSort,
  loading = false,
  error = null,
  emptyMessage,
  loadingMessage,
}) => {
  const { t } = useTranslation("common");
  const resolvedEmptyMessage = emptyMessage || t("table.emptyDefault");
  const resolvedLoadingMessage = loadingMessage || t("table.loadingDefault");
  return (
    <div className="table-responsive">
      <table className="table">
        <TableHeader columns={columns} sortColumn={sortColumn} onSort={onSort} />
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-4">
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                {resolvedLoadingMessage}
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-danger py-4">
                {error}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {resolvedEmptyMessage}
              </td>
            </tr>
          ) : (
            <TableBody columns={columns} rows={rows} />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
