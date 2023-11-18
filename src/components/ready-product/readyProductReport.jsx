import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import { getReadyProductByDateRangeGroupByModel } from "../../services/readyProductService";
import ReadyProductGroupByTable from "../tables/readyProductGroupByTable";

class ReadyProductReport extends Form {
  state = {
    data: [],
    dateFrom: "",
    dateTo: "",
    errors: {},
    loading: false,
    filters: [
      { id: 1, name: "Omborga kirdi" },
      { id: 2, name: "Ombordan chiqdi" },
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
      const { data } = await getReadyProductByDateRangeGroupByModel(
        from,
        to,
        id
      );
      this.setState({ data, loading: false, transactionType: id });
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, filters, sortColumn, fields, loading, transactionType } =
      this.state;

    const reports = data.map((d) => ({
      id: d.model.sapCode,
      model: d.model.name,
      sapCode: d.model.sapCode,
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

        <ReadyProductGroupByTable
          rows={reports ?? []}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
          fields={fields}
          transactionType={transactionType}
        />
      </>
    );
  }
}

export default ReadyProductReport;
