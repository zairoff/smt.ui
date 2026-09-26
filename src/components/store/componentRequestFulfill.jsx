import React, { Component } from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import Table from "../common/table";
import {
  getOpenComponentRequests,
  markItemNotFound,
  transferItems,
} from "../../services/componentRequestService";

const REFRESH_INTERVAL_MS = 20000;

class ComponentRequestFulfill extends Component {
  state = {
    requests: [],
    selectedItemIds: [],
    loading: false,
  };

  componentDidMount() {
    this.load();
    this.intervalId = setInterval(this.load, REFRESH_INTERVAL_MS);
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  load = async () => {
    this.setState({ loading: true });
    try {
      const { data: requests } = await getOpenComponentRequests();
      const pendingIds = new Set(
        requests.flatMap((r) =>
          (r.items || [])
            .filter((i) => i.status === "Requested")
            .map((i) => i.id)
        )
      );
      this.setState((prevState) => ({
        requests,
        selectedItemIds: prevState.selectedItemIds.filter((id) =>
          pendingIds.has(id)
        ),
      }));
    } catch (ex) {
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
  };

  handleToggleSelect = (itemId) => {
    this.setState((prevState) => {
      const selected = prevState.selectedItemIds.includes(itemId);
      return {
        selectedItemIds: selected
          ? prevState.selectedItemIds.filter((id) => id !== itemId)
          : [...prevState.selectedItemIds, itemId],
      };
    });
  };

  handleMarkNotFound = async (itemId) => {
    const { t } = this.props;
    try {
      await markItemNotFound(itemId);
      this.setState((prevState) => ({
        selectedItemIds: prevState.selectedItemIds.filter((id) => id !== itemId),
      }));
      await this.load();
    } catch (ex) {
      toast.error(ex.response?.data?.message || t("common:errors.unexpected"));
    }
  };

  handleTransfer = async () => {
    const { t } = this.props;
    const { selectedItemIds } = this.state;

    if (selectedItemIds.length === 0) return;

    this.setState({ loading: true });
    try {
      await transferItems(selectedItemIds);
      this.setState({ selectedItemIds: [] });
      toast.success(t("componentRequestFulfill.transferSuccess"));
      await this.load();
    } catch (ex) {
      toast.error(ex.response?.data?.message || t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
  };

  renderRequestTable(request) {
    const { t } = this.props;
    const { selectedItemIds } = this.state;

    const pendingItems = (request.items || []).filter(
      (i) => i.status === "Requested"
    );

    const columns = [
      {
        path: "select",
        label: "",
        content: (item) => (
          <input
            type="checkbox"
            checked={selectedItemIds.includes(item.id)}
            onChange={() => this.handleToggleSelect(item.id)}
          />
        ),
      },
      { path: "rCode", label: t("componentRequestFulfill.rCode") },
      { path: "partNumber", label: t("componentRequestFulfill.partNumber") },
      {
        path: "actions",
        label: "",
        content: (item) => (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => this.handleMarkNotFound(item.id)}
          >
            {t("componentRequestFulfill.notFound")}
          </button>
        ),
      },
    ];

    return (
      <Table
        columns={columns}
        rows={pendingItems}
        onSort={() => {}}
        emptyMessage={t("componentRequestFulfill.noPendingItems")}
      />
    );
  }

  render() {
    const { t } = this.props;
    const { requests, selectedItemIds, loading } = this.state;

    return (
      <div className="m-2">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">
            {t("componentRequestFulfill.title")} ({requests.length})
          </h5>
          <div>
            <button
              type="button"
              className="btn btn-outline-primary me-2"
              onClick={this.load}
            >
              {t("componentRequestFulfill.refresh")}
            </button>
            <button
              type="button"
              className="btn btn-success"
              disabled={selectedItemIds.length === 0}
              onClick={this.handleTransfer}
            >
              {t("componentRequestFulfill.transferSelected")} (
              {selectedItemIds.length})
            </button>
          </div>
        </div>

        {requests.length === 0 && (
          <p className="text-muted">{t("componentRequestFulfill.noOpenRequests")}</p>
        )}

        {requests.map((request) => (
          <div key={request.id} className="mb-4">
            <h6>
              {request.lineName || t("componentRequestFulfill.noLine")} —{" "}
              {request.createdDate}
            </h6>
            {this.renderRequestTable(request)}
          </div>
        ))}
      </div>
    );
  }
}

export default withTranslation("store")(ComponentRequestFulfill);
