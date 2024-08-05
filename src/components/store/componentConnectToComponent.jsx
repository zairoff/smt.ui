import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import ReadyProductImportTable from "../tables/readyProductImportTable";
import * as XLSX from "xlsx";
import { connectComponents } from "../../services/componentService";

/**
 *  public enum TransactionType
    {
        All = 0,
        Import = 1,
        Export = 2,
        Deleted = 3,
    }
 */

class ComponentConnectToComponent extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { import: "" },
    imports: [],
    errors: {},
    loading: false,
    authorized: false,
  };

  async componentDidMount() {}

  handleDelete = async ({ id }) => {};

  currentPageCheck(data) {}

  handleSort = (sortColumn) => {};

  handlePageChange = (page) => {};

  _handleFile = async (e) => {
    console.log("reading input file:");
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    //console.log("jsonData", jsonData);
    const raw_data = jsonData.filter(
      (x) => x["PartNumber"] != undefined && x["Rcode"] != undefined
    );

    console.log(raw_data);
    try {
      await connectComponents(raw_data);
    } catch (ex) {
      console.log(ex);
    }
    //console.log(e.target.files[0]);
    //console.log(workbook);
    //console.log(jsonData);
  };

  render() {
    const { imports, sortColumn, loading, fields, errors, authorized } =
      this.state;

    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <input
          // accept=".zip,.rar"
          onInput={(e) => this._handleFile(e)}
          type="file"
        />
        <div className="col">
          <p className="mt-2"> </p>
          <ReadyProductImportTable
            rows={imports}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            authorized={authorized}
          />
        </div>
      </div>
    );
  }
}

export default ComponentConnectToComponent;
