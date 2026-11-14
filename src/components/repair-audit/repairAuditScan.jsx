import React from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { format } from "date-fns";
import Form from "../forms/form";
import { getPcbRepairers } from "../../services/pcbRepairerService";
import {
  getRepairAuditsByDateRange,
  pollRepairAuditsByDateRange,
  scanRepairAudit,
  REPAIR_AUDIT_TYPE,
} from "../../services/repairAuditService";

const SCAN_POLL_INTERVAL_MS = 5000;

const today = () => format(new Date(), "yyyy-MM-dd");

// The scan list is today's audits of the selected type as stored on the
// server, so scanning can be started on one device (e.g. a phone) and
// continued on another. A board counts once a day; it shows as re-confirmed
// when it was first scanned on an earlier day.
const toScanRow = (audit) => ({
  id: audit.id,
  time: audit.lastConfirmedDate,
  barcode: audit.barcode,
  modelName: audit.modelName,
  sapCode: audit.sapCode,
  employee: audit.employee,
  reconfirmed: audit.firstScannedDate.slice(0, 10) < today(),
});

const newestFirst = (a, b) =>
  b.time.localeCompare(a.time) || b.id - a.id;

class RepairAuditScan extends Form {
  barcodeRef = React.createRef();

  state = {
    fields: { barcode: "" },
    repairers: [],
    employee: "",
    type: REPAIR_AUDIT_TYPE.AUDIT,
    scans: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data: repairers } = await getPcbRepairers();
      this.setState({ repairers });
      await this.loadScans(this.state.type);
    } catch (ex) {
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
      this.setFocusOnBarcode();
    }

    this.scanPollTimer = setInterval(this.pollScans, SCAN_POLL_INTERVAL_MS);
  }

  componentWillUnmount() {
    clearInterval(this.scanPollTimer);
  }

  // Bumped on every local change to the scan list so an in-flight poll that
  // started before the change doesn't overwrite it with stale data.
  scanListVersion = 0;

  setScans(audits) {
    this.scanListVersion++;
    this.setState({ scans: audits.map(toScanRow).sort(newestFirst) });
  }

  async loadScans(type) {
    const { data } = await getRepairAuditsByDateRange(today(), today(), type);
    if (type === this.state.type) this.setScans(data);
  }

  pollScans = async () => {
    const { type, loading } = this.state;
    if (loading || document.hidden) return;

    const version = this.scanListVersion;
    try {
      const { data } = await pollRepairAuditsByDateRange(today(), today(), type);
      if (version !== this.scanListVersion || type !== this.state.type) return;

      const rows = data.map(toScanRow).sort(newestFirst);
      const key = (list) => list.map((s) => `${s.id}|${s.time}|${s.employee}`).join();
      if (key(rows) !== key(this.state.scans)) this.setScans(data);
    } catch {
      // Try again on the next tick.
    }
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.employee !== this.state.employee) {
      this.setFocusOnBarcode();
    }
  }

  setFocusOnBarcode() {
    if (this.barcodeRef.current) this.barcodeRef.current.focus();
  }

  handleSelectChange = async ({ target }) => {
    const { name, value } = target;
    if (name === "Repairer") this.setState({ employee: value });
    if (name === "Type") {
      const type = Number(value);
      this.scanListVersion++;
      this.setState({ type, scans: [], loading: true });
      try {
        await this.loadScans(type);
      } catch (ex) {
        toast.error(this.props.t("common:errors.unexpected"));
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  handleInputKeyPress = async (e) => {
    if (e.key !== "Enter") return;

    const { employee, type } = this.state;
    const barcode = e.target.value;
    const { t } = this.props;

    if (!employee) {
      toast.warning(t("repairAudit:scan.selectRepairerWarning"));
      return;
    }

    if (!barcode) return;

    this.setState({ loading: true });
    try {
      const { data: result } = await scanRepairAudit(barcode, employee, type);
      // A board already on today's list is re-scanned in place, not added twice.
      const scan = toScanRow(result);
      this.scanListVersion++;
      this.setState((prevState) => ({
        scans: [scan, ...prevState.scans.filter((s) => s.id !== scan.id)],
      }));
      toast.success(
        t(
          result.reconfirmed
            ? "repairAudit:scan.reconfirmed"
            : "repairAudit:scan.counted",
          { barcode: result.barcode }
        )
      );
    } catch (ex) {
      toast.error(
        (ex.response && ex.response.data && ex.response.data.message) ||
          t("repairAudit:scan.notFound")
      );
    } finally {
      this.setState({ loading: false, fields: { barcode: "" } });
      this.setFocusOnBarcode();
    }
  };

  render() {
    const { loading, fields, errors, repairers, scans } = this.state;
    const { t } = this.props;

    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}

        <div className="col-12">
          <h5>{t("repairAudit:scan.title")}</h5>
        </div>

        <div className="col-3">
          {this.renderSelect(
            "Type",
            [
              { id: REPAIR_AUDIT_TYPE.AUDIT, name: t("repairAudit:types.audit") },
              {
                id: REPAIR_AUDIT_TYPE.UTILIZATION,
                name: t("repairAudit:types.utilization"),
              },
            ],
            errors.type,
            this.handleSelectChange,
            "id",
            "name",
            t("repairAudit:types.type")
          )}
        </div>

        <div className="col-3">
          {this.renderSelect(
            "Repairer",
            repairers,
            errors.employee,
            this.handleSelectChange,
            "employee.fullName",
            "employee.fullName",
            t("repairAudit:scan.repairer")
          )}
        </div>

        <div className="col-4">
          {this.renderInput(
            "barcode",
            "",
            t("repairAudit:scan.scanPlaceholder"),
            fields.barcode,
            this.handleInputChange,
            errors.barcode,
            true,
            "text",
            this.barcodeRef,
            false,
            this.handleInputKeyPress
          )}
        </div>

        <div className="col-12 mt-3 d-flex align-items-center justify-content-between">
          <h5 className="mb-0">{t("repairAudit:scan.sessionTitle")}</h5>
          <span className="badge bg-primary fs-6">
            {t("repairAudit:scan.totalBoards", { count: scans.length })}
          </span>
        </div>

        <div className="col-12 mt-3">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>{t("repairAudit:scan.columns.model")}</th>
                <th>{t("repairAudit:scan.columns.barcode")}</th>
                <th>{t("repairAudit:scan.columns.sapCode")}</th>
                <th>{t("repairAudit:scan.columns.employee")}</th>
                <th>{t("repairAudit:scan.columns.status")}</th>
                <th>{t("repairAudit:scan.columns.time")}</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s.id}>
                  <td>{s.modelName}</td>
                  <td>{s.barcode}</td>
                  <td>{s.sapCode}</td>
                  <td>{s.employee}</td>
                  <td>
                    <span
                      className={`badge ${
                        s.reconfirmed ? "bg-secondary" : "bg-success"
                      }`}
                    >
                      {t(
                        s.reconfirmed
                          ? "repairAudit:scan.statusReconfirmed"
                          : "repairAudit:scan.statusNew"
                      )}
                    </span>
                  </td>
                  <td>{s.time}</td>
                </tr>
              ))}
              {scans.length === 0 && (
                <tr>
                  <td colSpan="6">{t("repairAudit:scan.noBoardsYet")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default withTranslation(["repairAudit", "common"])(RepairAuditScan);
