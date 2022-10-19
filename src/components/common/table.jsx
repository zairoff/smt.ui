import React from "react";
import TableBody from "./tableBody";
import TableHeader from "./tableHeader";

const Table = ({ columns, rows, sortColumn, onSort }) => {
  return (
    <table className="table">
        <TableHeader columns={columns} sortColumn={sortColumn} onSort={onSort} />
        <TableBody columns={columns} rows={rows} />
      </table>
  );
};

export default Table;
