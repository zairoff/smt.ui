import React, { Component } from "react";
import Table from "../../common/table";

class QrReaderTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "name", label: "NAME" },
    { path: "position", label: "POSITION" },
    {
      path: "button",
      content: (qrReader) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(qrReader)}
          className="btn btn-danger"
        >
          Delete
        </button>
      ),
    },
  ];
  render() {
    const { rows, sortColumn, onSort } = this.props;
    return (
      <Table
        columns={this.columns}
        rows={rows}
        sortColumn={sortColumn}
        onSort={onSort}
      />
    );
  }
}

export default QrReaderTable;
