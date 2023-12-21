import React, { Component } from "react";
import Table from "../common/table";

class DetailedDefectTable extends Component {
  render() {
    const { rows, sortColumn, onSort, status } = this.props;

    const columns = status
      ? [
          { path: "line.name", label: "LINE" },
          { path: "model.name", label: "MODEL" },
          { path: "defect.name", label: "DEFECT" },
          { path: "createdDate", label: "KIRITILDI" },
        ]
      : [
          { path: "line.name", label: "LINE" },
          { path: "model.name", label: "MODEL" },
          { path: "defect.name", label: "DEFECT" },
          { path: "createdDate", label: "KIRITILDI" },
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

export default DetailedDefectTable;
