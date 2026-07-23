import React from "react";
import { withTranslation } from "react-i18next";

const ConfirmModal = ({
  show,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  t,
}) => {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" />
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title || t("confirmDelete.title")}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label={t("buttons.close")}
                onClick={onCancel}
              />
            </div>
            <div className="modal-body">
              {message || t("confirmDelete.message")}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
              >
                {cancelLabel || t("buttons.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
              >
                {confirmLabel || t("buttons.delete")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default withTranslation("common")(ConfirmModal);
