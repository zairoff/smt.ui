import React from "react";
import { useTranslation } from "react-i18next";

export const STATUS_FILTERS = ["active", "disabled", "all"];

export function filterByStatus(rows, status) {
  if (status === "active") return rows.filter((r) => r.isActive);
  if (status === "disabled") return rows.filter((r) => !r.isActive);
  return rows;
}

// Active / Disabled / All toggle for soft-deletable entities (models, defects).
// Shows a count per option so disabled items stay discoverable.
const StatusFilter = ({ rows, value, onChange }) => {
  const { t } = useTranslation("common");

  return (
    <div className="btn-group mb-2" role="group" aria-label={t("status.label")}>
      {STATUS_FILTERS.map((status) => (
        <button
          key={status}
          type="button"
          className={
            "btn " +
            (value === status ? "btn-secondary" : "btn-outline-secondary")
          }
          aria-pressed={value === status}
          onClick={() => onChange(status)}
        >
          {t(`status.${status}`)} ({filterByStatus(rows, status).length})
        </button>
      ))}
    </div>
  );
};

export default StatusFilter;
