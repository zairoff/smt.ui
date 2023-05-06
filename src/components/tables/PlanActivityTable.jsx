import React, { Component } from "react";
import Table from "../common/table";
import { Link } from "react-router-dom";

class PlanActivityTable extends Component {
  columns = [
    { path: "id", label: "ID" },
    { path: "line.name", label: "LINE" },
    { path: "issue", label: "NOMUVOFIQLIK" },
    { path: "reason", label: "SABAB" },
    { path: "act", label: "TO'G'IRLASH ISHLARI" },
    { path: "responsible", label: "JAVOBGARLAR" },
    { path: "status", label: "STATUS" },
    { path: "date", label: "KIRITILGAN SANA" },
    { path: "expires", label: "MUDDAT" },
    {
      path: "edit",
      content: (planActivity) => (
        <Link
          to={{
            pathname: "/plan-activity/" + planActivity.id,
          }}
          state={{ data: planActivity }}
          className="btn btn-primary"
        >
          Edit
        </Link>
      ),
    },
    {
      path: "button",
      content: (productBrand) => (
        <button
          type="button"
          onClick={() => this.props.onDelete(productBrand)}
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

export default PlanActivityTable;
