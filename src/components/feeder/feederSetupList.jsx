import React from "react";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import Form from "../forms/form";
import { getLines } from "../../services/lineService";
import { getFeederSetups } from "../../services/feeder/feederSetupService";
import {
  SETUP_STATUS,
  statusKey,
  statusBadge,
  sideKey,
  errorMessage,
  formatDate,
} from "../../services/feeder/feederConstants";

class FeederSetupList extends Form {
  state = {
    lines: [],
    setups: [],
    lineId: "",
    status: "",
    search: "",
    fields: {},
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data: lines } = await getLines();
      this.setState({ lines: lines.filter((l) => l.isActive !== false) });
    } catch (ex) {
      toast.error(errorMessage(ex, this.props.t));
    }
    await this.loadSetups();
  }

  async loadSetups() {
    const { lineId, status } = this.state;
    this.setState({ loading: true });
    try {
      const { data: setups } = await getFeederSetups({
        lineId: lineId || undefined,
        status: status === "" ? undefined : status,
      });
      this.setState({ setups });
    } catch (ex) {
      toast.error(errorMessage(ex, this.props.t));
    } finally {
      this.setState({ loading: false });
    }
  }

  setFilter = (changes) => {
    this.setState(changes, () => this.loadSetups());
  };

  render() {
    const { t } = this.props;
    const { lines, setups, lineId, status, search, loading } = this.state;
    const query = search.trim().toLowerCase();
    const visible = query
      ? setups.filter((s) => (s.modelName || "").toLowerCase().includes(query))
      : setups;

    return (
      <div className="row">
        {loading && <ReactLoading className="loading" type="spin" color="blue" />}

        <div className="col-12 d-flex align-items-center justify-content-between mb-2">
          <h5 className="mb-0">{t("feeder:setups.title")}</h5>
          <Link className="btn btn-primary" to="/feeder-setup-import">
            {t("feeder:setups.importNew")}
          </Link>
        </div>

        <div className="col-md-3">
          {this.renderSelect(
            "Line",
            lines,
            "",
            ({ target }) => this.setFilter({ lineId: target.value }),
            "id",
            "name",
            t("feeder:common.line"),
            lineId
          )}
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="status">
            {t("feeder:common.status")}
          </label>
          <select
            id="status"
            className="form-select form-select-lg"
            value={status}
            onChange={(e) => this.setFilter({ status: e.target.value })}
          >
            <option value="">{t("feeder:setups.allStatuses")}</option>
            {Object.values(SETUP_STATUS).map((s) => (
              <option key={s} value={s}>
                {t(`feeder:status.${statusKey(s)}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label" htmlFor="search">
            {t("feeder:common.model")}
          </label>
          <input
            id="search"
            className="form-control form-control-lg"
            value={search}
            placeholder={t("feeder:setups.searchModel")}
            onChange={(e) => this.setState({ search: e.target.value })}
          />
        </div>

        <div className="col-12 mt-3">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>{t("feeder:common.line")}</th>
                <th>{t("feeder:common.model")}</th>
                <th>{t("feeder:common.side")}</th>
                <th>{t("feeder:common.version")}</th>
                <th>{t("feeder:common.status")}</th>
                <th>{t("feeder:setups.items")}</th>
                <th>{t("feeder:setups.created")}</th>
                <th>{t("feeder:setups.activated")}</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id}>
                  <td>{s.lineName}</td>
                  <td>
                    <Link to={`/feeder-setup/${s.id}`}>{s.modelName}</Link>
                  </td>
                  <td>{t(`feeder:side.${sideKey(s.side)}`)}</td>
                  <td>v{s.version}</td>
                  <td>
                    <span className={`badge ${statusBadge(s.status)}`}>
                      {t(`feeder:status.${statusKey(s.status)}`)}
                    </span>
                  </td>
                  <td>{s.itemCount}</td>
                  <td className="small">
                    {s.createdBy}
                    <br />
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="small">
                    {s.activatedBy}
                    <br />
                    {formatDate(s.activatedAt)}
                  </td>
                </tr>
              ))}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-muted">
                    {t("feeder:setups.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default withTranslation(["feeder", "common"])(FeederSetupList);
