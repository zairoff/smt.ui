import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import {
  deleteReturnedProductTransaction,
  getReturnedProductByDateRange,
  getReturnedProductByDateRangeGroupByModel,
} from "../../services/returnedProductTransactionService";
import ReturnProductGroupByTable from "../tables/returnProductGroupByTable";

class ReturnProductReport extends Form {
  state = {
    data: [],
    dateFrom: "",
    dateTo: "",
    errors: {},
    loading: false,
    authorized: false,
    filters: [
      { id: 1, name: "BUFFERGA KIRISH (ZAVOD OXANGARON)" },
      { id: 5, name: "BUFFERDAN CHIQISH (REMONTGA)" },
      { id: 2, name: "REMONTDAN CHIQISH (OMBORGA)" },
      { id: 3, name: "REMONTDAN CHIQISH (OMBOR, UTILIZATSIYAGA)" },
      { id: 4, name: "OMBORDAN CHIQISH (ZAVODGA OXANGARON)" },
      { id: 6, name: "OMBORDAN CHIQISH (UTILIZATSIYAGA)" },
    ],
    sortColumn: { path: "", order: "asc" },
    fields: { from: "", to: "" },
    transactionType: "",
  };

  handleFilterChange = async ({ target }) => {
    const { value: id } = target;
    const { from, to } = this.state.fields;

    if (!from || !to || !id) return;

    this.setState({ loading: true });

    try {
      const { data } = await getReturnedProductByDateRangeGroupByModel(
        from,
        to,
        parseInt(id)
      );
      this.setState({
        data,
        loading: false,
        transactionType: id,
        dateFrom: from,
        dateTo: to,
      });
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {};

  render() {
    const { data, filters, sortColumn, fields, loading, authorized } =
      this.state;

    const reports = data.map((d) => ({
      id: d.model.sapCode,
      model: d.model.name,
      sapCode: d.model.sapCode,
      barCode: d.model.barcode,
      count: d.count,
    }));

    return (
      <>
        <form className="border p-4 mt-2 mb-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="row pt-2">
            <div className="col">
              {this.renderInput(
                "from",
                "From",
                "",
                fields.from,
                this.handleInputChange,
                "",
                true,
                "date"
              )}
            </div>
            <div className="col">
              {this.renderInput(
                "to",
                "To",
                "",
                fields.to,
                this.handleInputChange,
                "",
                true,
                "date"
              )}
            </div>
            {
              <div className="col">
                {this.renderSelect(
                  "Filter",
                  filters,
                  "",
                  this.handleFilterChange
                )}
              </div>
            }
            <div className="col-2">
              <p className="mt-4"></p>
              <CSVLink
                className="btn btn-block btn-success btn-lg w-100"
                data={reports ?? []}
              >
                Excel
              </CSVLink>
            </div>
          </div>
        </form>

        <ReturnProductGroupByTable
          rows={reports}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
        />
      </>
    );
  }
}

export default ReturnProductReport;
