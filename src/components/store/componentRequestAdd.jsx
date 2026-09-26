import React from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import Form from "../forms/form";
import Table from "../common/table";
import { getLines } from "../../services/lineService";
import { searchComponent } from "../../services/componentService";
import { createComponentRequest } from "../../services/componentRequestService";

class ComponentRequestAdd extends Form {
  scanRef = React.createRef();

  state = {
    fields: { lineId: "", scanInput: "" },
    errors: {},
    lines: [],
    items: [],
    sortColumn: { path: "", order: "asc" },
    loading: false,
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  async componentDidMount() {
    this.setState({ loading: true });
    try {
      const { data: lines } = await getLines();
      this.setState({ lines });
    } catch (ex) {
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
    this.focusScanInput();
  }

  componentDidUpdate() {
    this.focusScanInput();
  }

  focusScanInput() {
    this.scanRef.current?.focus();
  }

  handleScanKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      this.handleAddItem();
    }
  };

  handleAddItem = async () => {
    const { t } = this.props;
    const { scanInput } = this.state.fields;
    const { items } = this.state;

    const query = scanInput.trim();
    if (!query) return;

    this.setState({ loading: true });
    try {
      const { data: component } = await searchComponent(query);

      if (!component) {
        toast.warning(t("componentRequestAdd.notFound", { query }));
        return;
      }

      if (items.some((i) => i.componentId === component.id)) {
        toast.warning(t("componentRequestAdd.alreadyAdded"));
        return;
      }

      const item = {
        componentId: component.id,
        rCode: component.rCode,
        partNumber: (component.partNumber || []).join(", "),
      };

      this.setState({ items: [...items, item] });
    } catch (ex) {
      toast.error(ex.response?.data?.message || t("common:errors.unexpected"));
    } finally {
      this.setState({
        loading: false,
        fields: { ...this.state.fields, scanInput: "" },
      });
    }
  };

  handleRemoveItem = (componentId) => {
    this.setState((prevState) => ({
      items: prevState.items.filter((i) => i.componentId !== componentId),
    }));
  };

  doSubmit = async () => {
    const { t } = this.props;
    const { fields, items } = this.state;

    if (items.length === 0) {
      toast.warning(t("componentRequestAdd.emptyItemsWarning"));
      return;
    }

    this.setState({ loading: true });
    try {
      await createComponentRequest({
        lineId: fields.lineId ? parseInt(fields.lineId) : null,
        items: items.map((i) => ({ componentId: i.componentId })),
      });

      this.setState({
        items: [],
        fields: { lineId: "", scanInput: "" },
      });
      toast.success(t("componentRequestAdd.submitSuccess"));
    } catch (ex) {
      toast.error(ex.response?.data?.message || t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { t } = this.props;
    const { lines, items, fields, errors, loading, sortColumn } = this.state;

    const columns = [
      { path: "rCode", label: t("componentRequestAdd.rCode") },
      { path: "partNumber", label: t("componentRequestAdd.partNumber") },
      {
        path: "actions",
        label: "",
        content: (item) => (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => this.handleRemoveItem(item.componentId)}
          >
            {t("componentRequestAdd.remove")}
          </button>
        ),
      },
    ];

    const rows = items.map((i) => ({ ...i, id: i.componentId }));

    return (
      <div className="m-2 row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="col-md-4">
          {this.renderSelect(
            "lineId",
            lines,
            errors.lineId,
            this.handleInputChange,
            "id",
            "name",
            t("componentRequestAdd.line"),
            fields.lineId
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "scanInput",
            t("componentRequestAdd.component"),
            t("componentRequestAdd.scanPlaceholder"),
            fields.scanInput,
            this.handleInputChange,
            errors.scanInput,
            false,
            "text",
            this.scanRef,
            false,
            this.handleScanKeyDown
          )}
          <p className="mt-2"> </p>
          <button
            type="button"
            className="btn btn-secondary w-100"
            onClick={this.handleAddItem}
          >
            {t("componentRequestAdd.addItem")}
          </button>
          <p className="mt-2"> </p>
          {this.renderButton(
            t("componentRequestAdd.submit"),
            "button",
            this.doSubmit
          )}
        </div>
        <div className="col-md-8">
          <Table
            columns={columns}
            rows={rows}
            sortColumn={sortColumn}
            onSort={this.handleSort}
          />
        </div>
      </div>
    );
  }
}

export default withTranslation("store")(ComponentRequestAdd);
