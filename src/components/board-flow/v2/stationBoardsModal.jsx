import React from "react";
import ReactLoading from "react-loading";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

const STATUS_LABEL = {
  0: { key: "shared.boardStatus.inProgress", className: "bg-primary" },
  1: { key: "shared.boardStatus.flagged", className: "bg-danger" },
  2: { key: "shared.boardStatus.completed", className: "bg-success" },
  3: { key: "shared.boardStatus.deleted", className: "bg-secondary" },
};

const StationBoardsModal = ({ show, loading, stationName, boards, onClose, onSelectBoard }) => {
  const { t } = useTranslation("boardFlow");

  if (!show) return null;

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {t("stationBoardsModal.title", { station: stationName })}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              {loading && (
                <ReactLoading className="loading" type="spin" color="blue" />
              )}
              {!loading && boards.length === 0 && (
                <p className="mb-0">{t("stationBoardsModal.noBoards")}</p>
              )}
              {!loading && boards.length > 0 && (
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>{t("stationBoardsModal.columns.qrCode")}</th>
                      <th>{t("stationBoardsModal.columns.model")}</th>
                      <th>{t("stationBoardsModal.columns.status")}</th>
                      <th>{t("stationBoardsModal.columns.lastUpdated")}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {boards.map((b) => {
                      const status = STATUS_LABEL[b.status] || {
                        key: null,
                        className: "bg-secondary",
                      };
                      return (
                        <tr key={b.id}>
                          <td>{b.qrCode}</td>
                          <td>{b.model ? b.model.name : ""}</td>
                          <td>
                            <span className={`badge ${status.className}`}>
                              {status.key ? t(status.key) : b.status}
                            </span>
                          </td>
                          <td>
                            {format(new Date(b.updatedAt), "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => onSelectBoard(b.qrCode)}
                            >
                              {t("shared.historyButton")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                {t("common:buttons.close")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
};

export default StationBoardsModal;
