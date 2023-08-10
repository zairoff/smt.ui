import React, { Component } from "react";
import Table from "../common/table";
import { Link } from "react-router-dom";

class FtqDefectTable extends Component {
  render() {
    const { rows, sortColumn, onSort, fields, line } = this.props;

    const columns = [
      { path: "name", label: "DEFECT" },
      { path: "count", label: "COUNT" },
      {
        path: "details",
        content: (defect) => (
          <Link
            to={{
              pathname: "/detailed",
            }}
            state={{
              data: {
                from: fields.from,
                to: fields.to,
                line: line,
                status: true,
                display: "defect",
                defectName: defect.name,
              },
            }}
            className="btn btn-primary"
          >
            details
          </Link>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        rows={rows}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default FtqDefectTable;
