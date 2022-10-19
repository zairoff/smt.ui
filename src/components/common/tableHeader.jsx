import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faSortAsc } from "@fortawesome/free-solid-svg-icons";
import { faSortDesc } from "@fortawesome/free-solid-svg-icons";

library.add(faSortAsc);
library.add(faSortDesc);

class TableHeader extends Component {
  raiseSort = (column) => {
    const sortColumn = { ...this.props.sortColumn };
    if (sortColumn.path === column.path)
      sortColumn.order = sortColumn.order === "asc" ? "desc" : "asc";
    else {
      sortColumn.path = column.path;
      sortColumn.order = "asc";
    }
    this.props.onSort(sortColumn);
  };

  renderSortIcon = (column) => {
    const { sortColumn } = this.props;

    if (column.path !== sortColumn.path) return null;
    if (sortColumn.order === "asc")
      return (
        <FontAwesomeIcon className="ms-2" icon={faSortAsc}></FontAwesomeIcon>
      );

    return (
      <FontAwesomeIcon className="ms-2" icon={faSortDesc}></FontAwesomeIcon>
    );
  };

  render() {
    return (
      <thead>
        <tr>
          {this.props.columns.map((column) => (
            <th
              className="align-middle text-center"
              key={column.path}
              onClick={() => this.raiseSort(column)}
            >
              {column.label}
              {this.renderSortIcon(column)}
            </th>
          ))}
        </tr>
      </thead>
    );
  }
}

export default TableHeader;
