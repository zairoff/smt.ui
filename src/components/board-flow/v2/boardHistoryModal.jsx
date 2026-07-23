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

const MOVEMENT_STATUS_LABEL = {
  0: { key: "boardHistoryModal.movementStatus.passed", className: "bg-success" },
  1: {
    key: "boardHistoryModal.movementStatus.missingPrevious",
    className: "bg-danger",
  },
  2: { key: "boardHistoryModal.movementStatus.deleted", className: "bg-secondary" },
};

const BoardHistoryModal = ({ show, loading, data, onClose }) => {
  const { t } = useTranslation("boardFlow");

  if (!show) return null;

  const board = data && data.board;
  const movements = (data && data.movements) || [];

  return (
    <>
      <div className="modal show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {t("boardHistoryModal.title")}{" "}
                {board ? `— ${board.qrCode}` : ""}
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
              {!loading && !board && (
                <p className="mb-0">{t("boardHistoryModal.notFound")}</p>
              )}
              {!loading && board && (
                <>
                  <div className="row mb-3">
                    <div className="col">
                      <strong>{t("boardHistoryModal.lineLabel")}</strong>{" "}
                      {board.line ? board.line.name : ""}
                    </div>
                    <div className="col">
                      <strong>{t("boardHistoryModal.modelLabel")}</strong>{" "}
                      {board.model ? board.model.name : ""}
                    </div>
                    <div className="col">
                      <strong>{t("boardHistoryModal.statusLabel")}</strong>{" "}
                      <span
                        className={`badge ${
                          (STATUS_LABEL[board.status] || {}).className
                        }`}
                      >
                        {t((STATUS_LABEL[board.status] || {}).key)}
                      </span>
                    </div>
                  </div>
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>{t("boardHistoryModal.columns.time")}</th>
                        <th>{t("boardHistoryModal.columns.station")}</th>
                        <th>{t("boardHistoryModal.columns.result")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.map((m) => (
                        <tr key={m.id}>
                          <td>
                            {format(new Date(m.dateTime), "yyyy-MM-dd HH:mm:ss")}
                          </td>
                          <td>{m.qrReaderName}</td>
                          <td>
                            <span
                              className={`badge ${
                                (MOVEMENT_STATUS_LABEL[m.status] || {})
                                  .className
                              }`}
                            >
                              {t((MOVEMENT_STATUS_LABEL[m.status] || {}).key)}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {movements.length === 0 && (
                        <tr>
                          <td colSpan="3">
                            {t("boardHistoryModal.noMovements")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </>
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

export default BoardHistoryModal;
