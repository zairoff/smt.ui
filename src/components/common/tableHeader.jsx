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

  handleKeyDown = (e, column) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.raiseSort(column);
    }
  };

  render() {
    const { sortColumn } = this.props;

    return (
      <thead>
        <tr>
          {this.props.columns.map((column) => {
            const sortable = !column.content;
            const isSorted = sortable && sortColumn && column.path === sortColumn.path;

            return (
              <th
                className="align-middle text-center"
                key={column.path}
                onClick={sortable ? () => this.raiseSort(column) : undefined}
                tabIndex={sortable ? 0 : undefined}
                role={sortable ? "button" : undefined}
                aria-sort={
                  isSorted
                    ? sortColumn.order === "asc"
                      ? "ascending"
                      : "descending"
                    : undefined
                }
                onKeyDown={sortable ? (e) => this.handleKeyDown(e, column) : undefined}
                style={sortable ? { cursor: "pointer" } : undefined}
              >
                {column.label}
                {this.renderSortIcon(column)}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  }
}

export default TableHeader;
