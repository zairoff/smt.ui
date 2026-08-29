import React from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { format, startOfMonth } from "date-fns";
import _ from "lodash";
import Form from "../forms/form";
import RepairAuditTable from "../tables/repairAuditTable";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import {
  getRepairAuditsByDateRange,
  deleteRepairAudit,
} from "../../services/repairAuditService";

class RepairAuditReport extends Form {
  state = {
    sortColumn: { path: "", order: "asc" },
    fields: {
      from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      to: format(new Date(), "yyyy-MM-dd"),
    },
    data: [],
    currentPage: 1,
    pageSize: 25,
    errors: {},
    loading: true,
  };

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch = async () => {
    const { from, to } = this.state.fields;
    this.setState({ loading: true });
    try {
      const { data } = await getRepairAuditsByDateRange(from, to);
      this.setState({ data, currentPage: 1 });
    } catch (ex) {
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const data = clone.filter((d) => d.id !== id);
    this.setState({ data, loading: true });

    try {
      await deleteRepairAudit(id);
    } catch (ex) {
      this.setState({ data: clone });
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const { fields, data, sortColumn, currentPage, pageSize, errors, loading } =
      this.state;
    const { t } = this.props;

    const sortedRows = _.orderBy(data, [sortColumn.path], [sortColumn.order]);
    const rows = paginate(sortedRows, currentPage, pageSize);

    const byModel = _.chain(data)
      .groupBy("modelName")
      .map((items, modelName) => ({ modelName, count: items.length }))
      .orderBy(["modelName"], ["asc"])
      .value();

    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}

        <div className="col-12">
          <h5>{t("repairAudit:report.title")}</h5>
        </div>

        <div className="col-2">
          {this.renderInput(
            "from",
            t("repairAudit:report.from"),
            "",
            fields.from,
            this.handleInputChange,
            errors.from,
            false,
            "date"
          )}
        </div>
        <div className="col-2">
          {this.renderInput(
            "to",
            t("repairAudit:report.to"),
            "",
            fields.to,
            this.handleInputChange,
            errors.to,
            false,
            "date"
          )}
        </div>
        <div className="col-2 mt-4">
          {this.renderButton(t("repairAudit:report.search"), "button", this.handleSearch)}
        </div>

        <div className="col-12 mt-3 d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{t("repairAudit:report.summaryTitle")}</h5>
          <span className="badge bg-primary fs-6">
            {t("repairAudit:report.total")} {data.length}
          </span>
        </div>

        <div className="col-12 mt-2">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{t("repairAudit:report.summaryModel")}</th>
                <th>{t("repairAudit:report.summaryCount")}</th>
              </tr>
            </thead>
            <tbody>
              {byModel.map((m) => (
                <tr key={m.modelName}>
                  <td>{m.modelName}</td>
                  <td>{m.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-12 mt-3">
          <h5>{t("repairAudit:report.listTitle")}</h5>
          <RepairAuditTable
            rows={rows}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
          />
          <Pagination
            itemsCount={data.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default withTranslation(["repairAudit", "common"])(RepairAuditReport);
