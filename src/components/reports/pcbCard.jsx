import React, { Component } from "react";
import { SortableHandle } from "react-sortable-hoc";

const PcbCard = ({
  name,
  employeeId,
  position,
  count,
  shouldUseDragHandle,
  onClick,
  hideItems,
}) => {
  return (
    <div
      className="card bg-light m-2"
      style={{ maxWidth: "14rem", width: "200px" }}
    >
      {shouldUseDragHandle && <Handle name={name} />}
      <div
        className="card-body"
        onClick={() => onClick({ employeeId, position })}
      >
        <h1 className="card-title d-flex align-items-center justify-content-center">
          {hideItems ? "X" : position}
        </h1>
      </div>
      <span
        className={
          count === 0
            ? "d-none"
            : "position-absolute top-0 start-100 p-2 translate-middle badge bg-danger"
        }
      >
        {count}
      </span>
    </div>
  );
};

const Handle = SortableHandle(({ name }) => (
  <div className="card-header text-truncate">{name}</div>
));

export default PcbCard;
