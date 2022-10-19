import React, { Component } from "react";

const ButtonBadge = ({ id, value, reports, onClick }) => {
  const { length } = reports.filter((r) => r.defect.id === id);
  const spanClass =
    "position-absolute top-0 start-100 p-2 translate-middle badge rounded-pill bg-danger";
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className="btn btn-secondary ms-2 me-2 mb-4 position-relative p-4"
      style={{ width: "fit-content" }}
    >
      {value}
      <span className={length === 0 ? "d-none " + spanClass : spanClass}>
        {length}
      </span>
    </button>
  );
};

export default ButtonBadge;
