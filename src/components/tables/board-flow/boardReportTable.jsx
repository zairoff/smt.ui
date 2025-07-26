import React, { Component } from "react";
import Table from "../../common/table";

/*
    public enum BoardPassStatus
    {
        Passed = 0,
        MissingPreviousPass = 1,
        Deleted = 2,
    }
*/
class BoardReportTable extends Component {
  columns = [];
  render() {
    const { rows, sortColumn, onSort } = this.props;

    const columns = [
      { path: "qrCode", label: "QR" },
      { path: "qrReader.name", label: "READER" },
      { path: "model.name", label: "MODEL" },
      { path: "model.sapCode", label: "SAP CODE" },
      { path: "dateTime", label: "VAQT" },
      {
        path: "button",
        content: (readyProduct) => (
          <button
            type="button"
            onClick={() => this.props.onDelete(readyProduct)}
            className="btn btn-danger"
          >
            Delete
          </button>
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

export default BoardReportTable;
