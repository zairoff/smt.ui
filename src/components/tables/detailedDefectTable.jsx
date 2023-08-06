import React, { Component } from "react";
import Table from "../common/table";

class DetailedDefectTable extends Component {

    render() {
        const { rows, sortColumn, onSort, status } = this.props;

        const columns = status ? [
            { path: "line.name", label: "LINE" },
            { path: "barcode", label: "BARCODE" },
            { path: "model.name", label: "MODEL" },
            { path: "defect.name", label: "DEFECT" },
            { path: "action", label: "TO'G'IRLASH" },
            { path: "condition", label: "XOLATI" },
            { path: "employee", label: "TO'G'IRLADI" },
            { path: "createdDate", label: "KIRITILDI" },
            { path: "updatedDate", label: "TO'G'IRLANDI" },
        ] : [
            { path: "line.name", label: "LINE" },
            { path: "barcode", label: "BARCODE" },
            { path: "model.name", label: "MODEL" },
            { path: "defect.name", label: "DEFECT" },
            { path: "action", label: "TO'G'IRLASH" },
            { path: "condition", label: "XOLATI" },
            { path: "employee", label: "TO'G'IRLADI" },
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
