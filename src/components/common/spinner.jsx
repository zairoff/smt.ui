import React from "react";
import { useTranslation } from "react-i18next";

const Spinner = ({ label, small = false, className = "" }) => {
  const { t } = useTranslation("common");
  return (
    <span className={`d-inline-flex align-items-center ${className}`}>
      <span
        className={`spinner-border ${small ? "spinner-border-sm" : ""} me-2`}
        role="status"
        aria-hidden="true"
      />
      {label || t("table.loadingDefault")}
    </span>
  );
};

export default Spinner;
