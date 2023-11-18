import React, { Component } from "react";
import Table from "../common/table";
import { Link } from "react-router-dom";

class ReadyProductGroupByTable extends Component {
  render() {
    const { rows, sortColumn, fields, onSort, transactionType } = this.props;

    const columns = [
      { path: "model", label: "MODEL" },
      { path: "sapCode", label: "SAP CODE" },
      { path: "count", label: "SONI" },
      {
        path: "details",
        content: (readyproduct) => (
          <Link
            to={{
              pathname: "/ready-product-detailed",
            }}
            state={{
              data: {
                from: fields.from,
                to: fields.to,
                sapCode: readyproduct.sapCode,
                transactionType: transactionType,
              },
            }}
            className="btn btn-primary"
          >
            batafsil
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

export default ReadyProductGroupByTable;
