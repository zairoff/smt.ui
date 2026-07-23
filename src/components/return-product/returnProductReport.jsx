import React from "react";
import { CSVLink } from "react-csv";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
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
    sortColumn: { path: "", order: "asc" },
    fields: { from: "", to: "" },
    transactionType: "",
  };

  get filters() {
    const { t } = this.props;
    return [
      { id: 1, name: t("transactionTypeLabels.importFromFactoryToBuffer") },
      { id: 5, name: t("transactionTypeLabels.exportFromBufferToRepair") },
      { id: 2, name: t("transactionTypeLabels.exportFromRepairToStore") },
      { id: 3, name: t("transactionTypeLabels.exportFromRepairToUtilize") },
      { id: 4, name: t("transactionTypeLabels.exportFromStoreToFactory") },
      { id: 6, name: t("transactionTypeLabels.exportFromStoreToUtilize") },
    ];
  }

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
    const { data, sortColumn, fields, loading, authorized } = this.state;
    const { t } = this.props;

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
                t("dateRange.from"),
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
                t("dateRange.to"),
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
                  this.filters,
                  "",
                  this.handleFilterChange,
                  undefined,
                  undefined,
                  t("filterLabel")
                )}
              </div>
            }
            <div className="col-2">
              <p className="mt-4"></p>
              <CSVLink
                className="btn btn-block btn-success btn-lg w-100"
                data={reports ?? []}
              >
                {t("excelButton")}
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

export default withTranslation("returnProduct")(ReturnProductReport);
