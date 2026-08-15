import React from "react";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "./form";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import {
  addInstructionPosition,
  deleteInstructionPosition,
  getInstructionPositions,
} from "../../services/instructionPositionService";
import { getLines } from "../../services/lineService";

class InstructionPositionForm extends Form {
  state = {
    sortColumn: { path: "order", order: "asc" },
    fields: { lineId: "", name: "", order: "" },
    currentPage: 1,
    pageSize: 15,
    data: [],
    lines: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const [{ data }, { data: lines }] = await Promise.all([
        getInstructionPositions(),
        getLines(),
      ]);
      this.setState({ data, lines });
    } catch (ex) {
      toast.error(ex.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  doSubmit = async () => {
    const { data, fields } = this.state;
    const { t } = this.props;

    if (!fields.lineId) {
      this.setState({
        errors: {
          ...this.state.errors,
          lineId: t("pcbaInstruction:instructionPosition.lineRequired"),
        },
      });
      return;
    }
    if (!fields.name) {
      this.setState({
        errors: {
          ...this.state.errors,
          name: t("pcbaInstruction:instructionPosition.nameRequired"),
        },
      });
      return;
    }

    this.setState({ loading: true });
    try {
      const { data: result } = await addInstructionPosition({
        lineId: fields.lineId,
        name: fields.name,
        order: fields.order || 0,
      });
      const newData = [result, ...data];
      this.setState({
        data: newData,
        fields: { lineId: fields.lineId, name: "", order: "" },
      });
    } catch (ex) {
      this.catchExceptionMessage(ex, "name");
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDelete = async ({ id }) => {
    const clone = [...this.state.data];
    const { currentPage } = this.state;
    const data = clone.filter((d) => d.id !== id);
    if (this.currentPageCheck(data))
      this.setState({ data, currentPage: currentPage - 1, loading: true });
    else this.setState({ data, loading: true });

    try {
      await deleteInstructionPosition(id);
    } catch (ex) {
      this.setState({ data: clone });
      this.catchExceptionMessage(ex, "name");
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {
    const { pageSize } = this.state;

    return data.length % pageSize === 0;
  }

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };

  render() {
    const {
      data: allRows,
      lines,
      pageSize,
      currentPage,
      sortColumn,
      loading,
      fields,
      errors,
    } = this.state;
    const { t } = this.props;

    const sortedRows = _.orderBy(
      allRows,
      [sortColumn.path],
      [sortColumn.order]
    );
    const rows = paginate(sortedRows, currentPage, pageSize);

    return (
      <form className="m-2 row" onSubmit={this.handleSubmit}>
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col mt-4">
          <p className="text-muted small">
            {t("pcbaInstruction:instructionPosition.kioskUrlHint")}
          </p>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{t("pcbaInstruction:instructionPosition.columns.id")}</th>
                <th>{t("pcbaInstruction:instructionPosition.columns.line")}</th>
                <th>{t("pcbaInstruction:instructionPosition.columns.name")}</th>
                <th>{t("pcbaInstruction:instructionPosition.columns.order")}</th>
                <th>{t("pcbaInstruction:instructionPosition.columns.kioskUrl")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.lineName}</td>
                  <td>{r.name}</td>
                  <td>{r.order}</td>
                  <td>
                    <code>{`/instruction-display/${r.id}`}</code>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => this.handleDelete({ id: r.id })}
                    >
                      {t("common:buttons.delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-muted">
                    {t("pcbaInstruction:instructionPosition.noPositionsYet")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            itemsCount={allRows.length}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div className="col m-5">
          <h5>{t("pcbaInstruction:instructionPosition.addTitle")}</h5>
          {this.renderSelect(
            "lineId",
            lines,
            errors.lineId,
            this.handleInputChange
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "name",
            t("pcbaInstruction:instructionPosition.nameLabel"),
            "",
            fields.name,
            this.handleInputChange,
            errors.name,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "order",
            t("pcbaInstruction:instructionPosition.orderLabel"),
            "",
            fields.order,
            this.handleInputChange,
            errors.order,
            false,
            "number"
          )}
          <p className="mt-2"> </p>
          {this.renderButton(t("common:buttons.save"))}
        </div>
      </form>
    );
  }
}

export default withTranslation(["pcbaInstruction", "common"])(
  InstructionPositionForm
);
