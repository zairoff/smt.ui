import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Table from "../common/table";

class PcbRepairTable extends Component {
  columns = [
    { path: "barcode", label: "" },
    { path: "model.name", label: "" },
    { path: "line.name", label: "" },
    { path: "defect.name", label: "" },
    { path: "action", label: "" },
    { path: "condition", label: "" },
    { path: "employee", label: "" },
    {
      path: "delete",
      content: (repairer) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(repairer)}
          className="btn btn-danger"
        >
          {this.props.t("common:buttons.delete")}
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

export default withTranslation("common")(PcbRepairTable);
