import React, { Component } from "react";
import _ from "lodash";

class TableBody extends Component {
  renderCell = (row, column) => {
    if (column.content) return column.content(row);
    return _.get(row, column.path);
  };

  render() {
    const { columns, rows } = this.props;

    return (
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td
                className="align-middle text-center"
                key={column.path}
              >
                {this.renderCell(row, column)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }
}

export default TableBody;
