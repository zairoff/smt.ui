import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import { getPlanActivityByDateRange } from "../../services/planActivityService";
import PlanActivityReportTable from "../tables/PlanActivityReportTable";

class PlanActivityReport extends Form {
  state = {
    dateFrom: "",
    dateTo: "",
    errors: {},
    loading: false,
    sort: false,
    sortColumn: { path: "", order: "asc" },
    fields: { from: "", to: "" },
    data: [],
  };

  doSubmit = async () => {
    const { fields } = this.state;

    this.setState({ loading: true });
    try {
      const { data } = await getPlanActivityByDateRange(fields.from, fields.to);
      this.setState({ data, loading: false });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { data, sortColumn, fields, loading } = this.state;

    return (
      <>
        <form className="border p-4 mt-2 mb-4" onSubmit={this.handleSubmit}>
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}

          <div className="row">
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
            <div className="col-2">
              <p className="mt-4"></p>
              {this.renderButton("Search")}
            </div>
            <div className="col-2">
              <p className="mt-4"></p>
              <CSVLink
                className="btn btn-block btn-success btn-lg w-100"
                data={data}
              >
                Excel
              </CSVLink>
            </div>
          </div>
        </form>
        <PlanActivityReportTable
          rows={data}
          onSort={this.handleSort}
          sortColumn={sortColumn}
          onDelete={this.handleDelete}
        />
      </>
    );
  }
}

export default PlanActivityReport;
