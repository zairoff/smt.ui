import React from "react";
import ReactLoading from "react-loading";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import Form from "../forms/form";
import { getLines } from "../../services/lineService";
import {
  getLineMachine,
  saveLineMachine,
  addModule,
  updateModule,
  addSlots,
  setSlotActive,
} from "../../services/feeder/lineMachineService";
import {
  MACHINE_VENDOR,
  vendorKey,
  errorMessage,
} from "../../services/feeder/feederConstants";

// Machine layout of a line: modules and their feeder slots. Slots usually get
// created by the first Excel import, so this page is mostly for fixing layouts
// and printing slot stickers.
class LineMachinePage extends Form {
  state = {
    lines: [],
    lineId: "",
    machine: null,
    machineForm: { name: "", vendor: MACHINE_VENDOR.FUJI, requireSlotScan: false },
    newModule: { name: "", order: "" },
    moduleEdits: {},
    slotRanges: {},
    fields: {},
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    try {
      const { data: lines } = await getLines();
      this.setState({ lines: lines.filter((l) => l.isActive !== false) });
    } catch (ex) {
      toast.error(errorMessage(ex));
    } finally {
      this.setState({ loading: false });
    }
  }

  handleLineChange = async ({ target }) => {
    const lineId = target.value;
    this.setState({ lineId, machine: null });
    if (lineId) await this.loadMachine(lineId);
  };

  async loadMachine(lineId) {
    this.setState({ loading: true });
    try {
      const { data } = await getLineMachine(lineId);
      this.applyMachine(data || null);
    } catch (ex) {
      toast.error(errorMessage(ex));
    } finally {
      this.setState({ loading: false });
    }
  }

  applyMachine(machine) {
    const moduleEdits = {};
    (machine ? machine.modules : []).forEach((m) => {
      moduleEdits[m.id] = { name: m.name, order: m.order };
    });

    this.setState({
      machine,
      moduleEdits,
      machineForm: machine
        ? { name: machine.name, vendor: machine.vendor, requireSlotScan: !!machine.requireSlotScan }
        : { name: "", vendor: MACHINE_VENDOR.FUJI, requireSlotScan: false },
    });
  }

  // Runs a layout-changing request; every endpoint returns the whole updated machine.
  async run(request, successKey) {
    const { t } = this.props;
    this.setState({ loading: true });
    try {
      const { data } = await request();
      this.applyMachine(data);
      if (successKey) toast.success(t(successKey));
      return true;
    } catch (ex) {
      toast.error(errorMessage(ex));
      return false;
    } finally {
      this.setState({ loading: false });
    }
  }

  handleSaveMachine = (e) => {
    e.preventDefault();
    const { lineId, machineForm } = this.state;
    this.run(
      () =>
        saveLineMachine({
          lineId: Number(lineId),
          name: machineForm.name,
          vendor: Number(machineForm.vendor),
          requireSlotScan: machineForm.requireSlotScan,
        }),
      "feeder:machine.saved"
    );
  };

  handleAddModule = async (e) => {
    e.preventDefault();
    const { lineId, newModule, machine } = this.state;
    const order =
      newModule.order !== ""
        ? Number(newModule.order)
        : machine.modules.reduce((max, m) => Math.max(max, m.order), 0) + 1;

    const ok = await this.run(() =>
      addModule(lineId, { name: newModule.name, order })
    );
    if (ok) this.setState({ newModule: { name: "", order: "" } });
  };

  handleUpdateModule = (moduleId) => {
    const edit = this.state.moduleEdits[moduleId];
    this.run(
      () => updateModule(moduleId, { name: edit.name, order: Number(edit.order) }),
      "feeder:machine.saved"
    );
  };

  handleAddSlots = async (moduleId) => {
    const range = this.state.slotRanges[moduleId] || {};
    const ok = await this.run(() =>
      addSlots(moduleId, { from: Number(range.from), to: Number(range.to) })
    );
    if (ok)
      this.setState({
        slotRanges: { ...this.state.slotRanges, [moduleId]: { from: "", to: "" } },
      });
  };

  handleToggleSlot = (slot) => {
    this.run(() => setSlotActive(slot.id, !slot.isActive));
  };

  setNested(key, id, field, value) {
    const current = this.state[key][id] || {};
    this.setState({
      [key]: { ...this.state[key], [id]: { ...current, [field]: value } },
    });
  }

  renderMachineForm() {
    const { t } = this.props;
    const { machine, machineForm } = this.state;

    return (
      <form className="row g-2 align-items-end mb-3" onSubmit={this.handleSaveMachine}>
        <div className="col-md-4">
          <label className="form-label">{t("feeder:machine.name")}</label>
          <input
            className="form-control form-control-lg"
            value={machineForm.name}
            placeholder="NXT-III / NPM-W2"
            required
            onChange={(e) =>
              this.setState({ machineForm: { ...machineForm, name: e.target.value } })
            }
          />
        </div>
        <div className="col-md-3">
          <label className="form-label">{t("feeder:machine.vendor")}</label>
          <select
            className="form-select form-select-lg"
            value={machineForm.vendor}
            onChange={(e) =>
              this.setState({ machineForm: { ...machineForm, vendor: e.target.value } })
            }
          >
            {Object.values(MACHINE_VENDOR).map((v) => (
              <option key={v} value={v}>
                {t(`feeder:vendor.${vendorKey(v)}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <button type="submit" className="btn btn-primary btn-lg w-100">
            {machine ? t("feeder:common.save") : t("feeder:machine.create")}
          </button>
        </div>
        <div className="col-12">
          <label className="form-check-label">
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={machineForm.requireSlotScan}
              onChange={(e) =>
                this.setState({ machineForm: { ...machineForm, requireSlotScan: e.target.checked } })
              }
            />
            {t("feeder:machine.requireSlotScan")}
          </label>
          <div className="form-text">{t("feeder:machine.requireSlotScanHint")}</div>
        </div>
      </form>
    );
  }

  renderModule(module) {
    const { t } = this.props;
    const edit = this.state.moduleEdits[module.id] || {};
    const range = this.state.slotRanges[module.id] || { from: "", to: "" };
    const activeCount = module.slots.filter((s) => s.isActive).length;

    return (
      <div key={module.id} className="card mb-3">
        <div className="card-header d-flex flex-wrap gap-2 align-items-center">
          <input
            className="form-control form-control-sm fw-bold"
            style={{ width: 110 }}
            value={edit.name || ""}
            onChange={(e) => this.setNested("moduleEdits", module.id, "name", e.target.value)}
            aria-label={t("feeder:machine.moduleName")}
          />
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: 80 }}
            value={edit.order}
            onChange={(e) => this.setNested("moduleEdits", module.id, "order", e.target.value)}
            aria-label={t("feeder:machine.moduleOrder")}
            title={t("feeder:machine.moduleOrder")}
          />
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={edit.name === module.name && Number(edit.order) === module.order}
            onClick={() => this.handleUpdateModule(module.id)}
          >
            {t("feeder:common.save")}
          </button>
          <span className="ms-auto text-muted small">
            {t("feeder:machine.slotCount", { active: activeCount, total: module.slots.length })}
          </span>
        </div>
        <div className="card-body">
          <div className="d-flex flex-wrap gap-1 mb-2">
            {module.slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                className={`btn btn-sm ${
                  slot.isActive ? "btn-outline-success" : "btn-outline-secondary text-decoration-line-through"
                }`}
                style={{ minWidth: 48 }}
                title={
                  slot.slotCode +
                  (slot.currentRCode ? ` - ${slot.currentRCode}` : "") +
                  ` (${t(slot.isActive ? "feeder:machine.clickToDisable" : "feeder:machine.clickToEnable")})`
                }
                onClick={() => this.handleToggleSlot(slot)}
              >
                {slot.number}
              </button>
            ))}
            {module.slots.length === 0 && (
              <span className="text-muted">{t("feeder:machine.noSlots")}</span>
            )}
          </div>
          <div className="d-flex gap-2 align-items-center">
            <span className="small">{t("feeder:machine.addSlots")}</span>
            <input
              type="number"
              min="1"
              className="form-control form-control-sm"
              style={{ width: 80 }}
              placeholder={t("feeder:machine.from")}
              value={range.from}
              onChange={(e) => this.setNested("slotRanges", module.id, "from", e.target.value)}
            />
            <span>-</span>
            <input
              type="number"
              min="1"
              className="form-control form-control-sm"
              style={{ width: 80 }}
              placeholder={t("feeder:machine.to")}
              value={range.to}
              onChange={(e) => this.setNested("slotRanges", module.id, "to", e.target.value)}
            />
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              disabled={!range.from || !range.to}
              onClick={() => this.handleAddSlots(module.id)}
            >
              {t("feeder:common.add")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { t } = this.props;
    const { lines, lineId, machine, newModule, loading } = this.state;

    return (
      <div className="row">
        {loading && <ReactLoading className="loading" type="spin" color="blue" />}

        <div className="col-12 d-flex align-items-center justify-content-between">
          <h5>{t("feeder:machine.title")}</h5>
          {machine && (
            <a
              className="btn btn-success"
              href={`/feeder-slot-labels/${lineId}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("feeder:machine.printStickers")}
            </a>
          )}
        </div>

        <div className="col-md-4 mb-3">
          {this.renderSelect(
            "Line",
            lines,
            "",
            this.handleLineChange,
            "id",
            "name",
            t("feeder:common.line"),
            lineId
          )}
        </div>

        {lineId && !loading && (
          <div className="col-12">
            {!machine && (
              <div className="alert alert-info">{t("feeder:machine.noMachine")}</div>
            )}
            {this.renderMachineForm()}

            {machine && (
              <>
                <h6 className="mt-2">{t("feeder:machine.modules")}</h6>
                {machine.modules.map((m) => this.renderModule(m))}
                {machine.modules.length === 0 && (
                  <p className="text-muted">{t("feeder:machine.noModules")}</p>
                )}

                <form className="d-flex gap-2 align-items-center mb-4" onSubmit={this.handleAddModule}>
                  <input
                    className="form-control"
                    style={{ width: 160 }}
                    placeholder={t("feeder:machine.moduleName")}
                    value={newModule.name}
                    required
                    onChange={(e) => this.setState({ newModule: { ...newModule, name: e.target.value } })}
                  />
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: 110 }}
                    placeholder={t("feeder:machine.moduleOrder")}
                    value={newModule.order}
                    onChange={(e) => this.setState({ newModule: { ...newModule, order: e.target.value } })}
                  />
                  <button type="submit" className="btn btn-outline-primary">
                    {t("feeder:machine.addModule")}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default withTranslation(["feeder", "common"])(LineMachinePage);
