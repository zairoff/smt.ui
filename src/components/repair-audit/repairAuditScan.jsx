import React from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import { format } from "date-fns";
import Form from "../forms/form";
import { getPcbRepairers } from "../../services/pcbRepairerService";
import { scanRepairAudit } from "../../services/repairAuditService";

let nextRowKey = 0;

class RepairAuditScan extends Form {
  barcodeRef = React.createRef();

  state = {
    fields: { barcode: "" },
    repairers: [],
    employee: "",
    scans: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data: repairers } = await getPcbRepairers();
      this.setState({ repairers });
    } catch (ex) {
      toast.error(this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
      this.setFocusOnBarcode();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.employee !== this.state.employee) {
      this.setFocusOnBarcode();
    }
  }

  setFocusOnBarcode() {
    if (this.barcodeRef.current) this.barcodeRef.current.focus();
  }

  handleSelectChange = ({ target }) => {
    const { name, value } = target;
    if (name === "Repairer") this.setState({ employee: value });
  };

  handleInputKeyPress = async (e) => {
    if (e.key !== "Enter") return;

    const { employee, scans } = this.state;
    const barcode = e.target.value;
    const { t } = this.props;

    if (!employee) {
      toast.warning(t("repairAudit:scan.selectRepairerWarning"));
      return;
    }

    if (!barcode) return;

    this.setState({ loading: true });
    try {
      const { data: result } = await scanRepairAudit(barcode, employee);
      const scan = {
        key: nextRowKey++,
        time: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        barcode: result.barcode,
        modelName: result.modelName,
        lineName: result.lineName,
        employee: result.employee,
        reconfirmed: result.reconfirmed,
      };
      this.setState({ scans: [scan, ...scans] });
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

        <div className="col-4">
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
                <th>{t("repairAudit:scan.columns.time")}</th>
                <th>{t("repairAudit:scan.columns.barcode")}</th>
                <th>{t("repairAudit:scan.columns.model")}</th>
                <th>{t("repairAudit:scan.columns.line")}</th>
                <th>{t("repairAudit:scan.columns.employee")}</th>
                <th>{t("repairAudit:scan.columns.status")}</th>
              </tr>
            </thead>
            <tbody>
              {scans.map((s) => (
                <tr key={s.key}>
                  <td>{s.time}</td>
                  <td>{s.barcode}</td>
                  <td>{s.modelName}</td>
                  <td>{s.lineName}</td>
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
