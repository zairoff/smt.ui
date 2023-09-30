import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import { getReportsBy } from "../../services/reportService";
import {
  getByBrand,
  getByDefect,
  getByLine,
  getByModel,
  getByProduct,
} from "../../services/staticsService";
import Form from "../forms/form";
import StaticsGroupedTable from "../tables/staticsGroupedTable";
import StaticsTable from "../tables/staticsTable";
import ReactLoading from "react-loading";
import { format } from "date-fns";

class GroupByStaticsForm extends Form {
  state = {
    reports: [],
    dateFrom: "",
    dateTo: "",
    errors: {},
    loading: false,
    filters: [
      { id: 1, name: "Model" },
      { id: 2, name: "Line" },
      { id: 3, name: "Defect" },
    ],
    sort: false,
    sortColumn: { path: "", order: "asc" },
    fields: { from: "", to: "" },
    isFiltered: false,
  };

  handleFilterChange = async ({ target }) => {
    const { value: id } = target;
    const { from, to } = this.state.fields;

    if (!from || !to) return;

    this.setState({ loading: true });

    try {
      switch (id) {
        case "1": {
          const { data: reports } = await getByModel(from, to);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }

        case "2": {
          const { data: reports } = await getByLine(from, to);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }

        case "3": {
          const { data: reports } = await getByDefect(from, to);
          this.setState({ reports, loading: false, isFiltered: true });
          break;
        }

        default:
          this.setState({ loading: false });
          break;
      }
    } catch (ex) {
      toast.error(ex.message);
      this.setState({ loading: false });
    }
  };

  render() {
    const { reports, filters, sortColumn, fields, isFiltered, loading } =
      this.state;

    const excel = isFiltered
      ? reports
      : reports.map((d) => ({
          barcode: d.barcode,
          product: d.model.productBrand.product.name,
          brand: d.model.productBrand.brand.name,
          model: d.model.name,
          line: d.line.name,
          defect: d.defect.name,
          date: format(Date.parse(d.createdDate), "yyyy-MM-dd HH:mm:ss"),
        }));
    return (
      <>
        <form className="border p-4 mt-2 mb-4" onSubmit={this.handleSubmit}>
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="row pt-2">
            <div className="col">
              {this.renderInput(
                "from",
                "DAN",
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
                "GACHA",
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
              {this.renderButton("Search")}
            </div>
            <div className="col-2">
              <p className="mt-4"></p>
              <CSVLink
                className="btn btn-block btn-success btn-lg w-100"
                data={excel}
              >
                Excel
              </CSVLink>
            </div>
          </div>
        </form>
        {isFiltered ? (
          <StaticsGroupedTable
            rows={excel}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
        ) : (
          <StaticsTable
            rows={excel}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
        )}
      </>
    );
  }
}

export default GroupByStaticsForm;
