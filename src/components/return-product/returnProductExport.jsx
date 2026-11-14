import React from "react";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import Form from "../forms/form";
import ReactLoading from "react-loading";
import {
  exportReturnedProduct,
  getBufferState,
  getRepairState,
  getState,
  getStoreState,
  getUtilizeState,
} from "../../services/returnedProductTransactionService";
import ReturnedProductExportTable from "../tables/ReturnedProductExportTable";
import ScannedBoardsTable from "../tables/ScannedBoardsTable";
import {
  getModelByBarcode,
  getModelBySapCode,
} from "../../services/modelService";
import { exportScannedBoardsToExcel } from "../../utils/returnedProductExcelExport";
import {
  addReturnedProductScan,
  claimReturnedProductScans,
  deleteReturnedProductScan,
  getReturnedProductScans,
  pollReturnedProductScans,
} from "../../services/returnedProductScanService";

const SCAN_POLL_INTERVAL_MS = 5000;

/**
    public enum ReturnedProductTransactionType
    {
        All = 0,
        ImportFromFactoryToBuffer = 1,
        ExportFromRepairToStore = 2,
        ExportFromRepairToUtilize = 3,
        ExportFromStoreToFactory = 4,
        ExportFromBufferToRepair = 5,
        ExportFromStoreToUtilize = 6,
        Deleted = 7,
    }
 */

class ReturnProductExport extends Form {
  barcodeRef = React.createRef();

  state = {
    errors: {},
    data: [],
    scannedBoards: [],
    loading: false,
    sortColumn: { path: "", order: "asc" },
    authorized: false,
    selectedTransactionType: "",
    fields: { export: "" },
  };

  get filters() {
    const { t } = this.props;
    return [
      { id: 2, name: t("transactionTypeLabels.exportFromRepairToStore") },
      { id: 3, name: t("transactionTypeLabels.exportFromRepairToUtilize") },
      { id: 4, name: t("transactionTypeLabels.exportFromStoreToFactoryShort") },
      { id: 6, name: t("transactionTypeLabels.exportFromStoreToUtilize") },
      { id: 5, name: t("transactionTypeLabels.exportFromBufferToRepair") },
    ];
  }

  // Only exports leaving repair (to store or to utilization) go through the
  // scan-then-batch-export-to-Excel flow; other destinations keep the
  // original instant per-scan deduction.
  get excelExportTransactionTypes() {
    return [2, 3];
  }

  usesScanList(transactionType) {
    return this.excelExportTransactionTypes.includes(parseInt(transactionType));
  }

  // The scan list lives on the server so that scanning can be started on one
  // device (e.g. a phone) and continued/exported on another. It's shared per
  // destination and polled while a scan-list destination is selected.
  toScannedBoard = (scan) => {
    const missing = scan.modelId == null;
    return {
      ...scan,
      modelName: missing ? this.props.t("errors.modelNotFound") : scan.modelName,
      missing,
    };
  };

  // Bumped on every local change to the scan list so an in-flight poll that
  // started before the change doesn't overwrite it with stale data.
  scanListVersion = 0;

  setScannedBoards(scans) {
    this.scanListVersion++;
    this.setState({ scannedBoards: scans.map(this.toScannedBoard) });
  }

  startScanPolling() {
    this.stopScanPolling();
    this.scanPollTimer = setInterval(this.pollScannedBoards, SCAN_POLL_INTERVAL_MS);
  }

  stopScanPolling() {
    clearInterval(this.scanPollTimer);
    this.scanPollTimer = null;
  }

  pollScannedBoards = async () => {
    const { selectedTransactionType, loading } = this.state;
    if (loading || document.hidden || !this.usesScanList(selectedTransactionType)) {
      return;
    }

    const version = this.scanListVersion;
    try {
      const { data: scans } = await pollReturnedProductScans(
        parseInt(selectedTransactionType)
      );

      if (
        version !== this.scanListVersion ||
        selectedTransactionType !== this.state.selectedTransactionType
      ) {
        return;
      }

      const sameList =
        scans.map((s) => s.id).join() ===
        this.state.scannedBoards.map((b) => b.id).join();
      if (!sameList) this.setScannedBoards(scans);
    } catch {
      // Try again on the next tick.
    }
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  handleExportKeyPress = async (e) => {
    if (e.key === "Enter") {
      const { t } = this.props;
      try {
        let count = 0;
        let sapCode = "";
        let fiveLetterCode = "";

        const barcode = e.target.value;
        const { selectedTransactionType, data } = this.state;

        if (selectedTransactionType === "") {
          toast.warning(t("errors.selectDestinationFirst"));
          return;
        }

        if (
          barcode.length == 14 &&
          !barcode.includes("-") &&
          !barcode.includes("/")
        ) {
          fiveLetterCode = barcode.substring(0, 5);
          count = 1;
        }

        if (count === "" || count == 0 || fiveLetterCode === "") {
          const indexOf = barcode.indexOf("-");
          sapCode = barcode.substring(0, indexOf);
          count = barcode.substring(indexOf + 4, barcode.length);
          if (count === "" || sapCode === "") {
            toast.warning(t("errors.barcodeInvalid"));

            return;
          }
        }

        this.setState({
          loading: true,
          fields: { export: "" },
        });

        let model;
        try {
          const response =
            sapCode !== "" && count != 0
              ? await getModelBySapCode(sapCode)
              : await getModelByBarcode(fiveLetterCode);
          model = response.data;
        } catch {
          model = undefined;
        }

        if (this.usesScanList(selectedTransactionType)) {
          const missing = model === "" || model === undefined || model === null;

          const { data: scan } = await addReturnedProductScan({
            barcode,
            modelId: missing ? null : model.id,
            sapCode: missing ? sapCode : model.sapCode,
            serialCode: fiveLetterCode,
            count: parseInt(count) || 0,
            transactionType: parseInt(selectedTransactionType),
          });

          this.scanListVersion++;
          this.setState((prevState) => ({
            fields: { export: "" },
            scannedBoards: [...prevState.scannedBoards, this.toScannedBoard(scan)],
          }));
          return;
        }

        if (model === "" || model === undefined || model === null) {
          toast.warning(t("errors.modelNotFound"));
          return;
        }

        const currentModel = data.filter((x) => x.model.id == model.id);

        if (
          currentModel == null ||
          currentModel == undefined ||
          currentModel == ""
        ) {
          toast.warning(t("errors.modelNotFound"));
          return;
        }

        const returnedProductTransaction = {
          barcode,
          modelId: model.id,
          count,
          TransactionType: parseInt(selectedTransactionType),
        };

        await exportReturnedProduct(returnedProductTransaction);

        const { data: newData } = await getState(
          parseInt(selectedTransactionType)
        );

        this.setState({
          fields: { export: "" },
          data: newData,
        });
      } catch (ex) {
        toast.error(ex.response?.data?.message || this.props.t("common:errors.unexpected"));
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  handleRemoveScanned = async (id) => {
    try {
      await deleteReturnedProductScan(id);
    } catch (ex) {
      // Already removed (e.g. from another device); just drop it locally.
      if (ex.response?.status !== 404) {
        if (ex.response) toast.error(ex.response.data?.message || this.props.t("common:errors.unexpected"));
        return;
      }
    }

    this.scanListVersion++;
    this.setState((prevState) => ({
      scannedBoards: prevState.scannedBoards.filter((b) => b.id !== id),
    }));
  };

  handleExportToExcel = async () => {
    const { t } = this.props;
    const { selectedTransactionType } = this.state;
    const transactionType = parseInt(selectedTransactionType);

    if (this.state.scannedBoards.length === 0) {
      toast.warning(t("export.emptyScanWarning"));
      return;
    }

    this.setState({ loading: true });
    try {
      // Take the scans off the shared list first; only the ones we got back
      // are exported, so another device exporting at the same time can't
      // deduct the same boards twice.
      const { data: claimed } = await claimReturnedProductScans(
        transactionType,
        this.state.scannedBoards.map((b) => b.id)
      );
      const scannedBoards = claimed.map(this.toScannedBoard);

      if (scannedBoards.length === 0) {
        toast.warning(t("export.alreadyExportedWarning"));
        const { data: scans } = await getReturnedProductScans(transactionType);
        this.setScannedBoards(scans);
        return;
      }

      const committable = scannedBoards.filter((b) => !b.missing);
      const results = await Promise.allSettled(
        committable.map((b) =>
          exportReturnedProduct({
            barcode: b.barcode,
            modelId: b.modelId,
            count: b.count,
            TransactionType: parseInt(selectedTransactionType),
          })
        )
      );

      const failedCount = results.filter((r) => r.status === "rejected").length;
      if (failedCount > 0) {
        toast.error(t("export.partialFailureWarning", { count: failedCount }));
      }

      const destinationLabel =
        this.filters.find((f) => f.id === parseInt(selectedTransactionType))?.name || "";

      await exportScannedBoardsToExcel(scannedBoards, destinationLabel, t);

      const { data } = await getState(transactionType);
      // Re-read rather than clearing: boards scanned on another device while
      // we were exporting stay on the list.
      const { data: scans } = await getReturnedProductScans(transactionType);

      this.setState({ data });
      this.setScannedBoards(scans);
      if (failedCount === 0) {
        toast.success(t("export.exportSuccess"));
      }
    } catch (ex) {
      toast.error(ex.response?.data?.message || this.props.t("common:errors.unexpected"));
    } finally {
      this.setState({ loading: false });
    }
  };

  async componentDidMount() {
    const { user } = this.props;
    this.setState({ authorized: user != null });
  }

  componentWillUnmount() {
    this.stopScanPolling();
  }

  handleDelete = async (transaction) => {
    try {
      const { selectedTransactionType } = this.state;
      this.setState({ loading: true });
      const returnedProductTransaction = {
        modelId: transaction.model.id,
        count: transaction.count,
        TransactionType: parseInt(selectedTransactionType),
      };

      await exportReturnedProduct(returnedProductTransaction);

      const { data } = await getState(parseInt(selectedTransactionType));

      this.setState({ data });
    } catch (ex) {
      this.setState({ loading: false });
      toast.error(ex.response.data.title);
    }
  };

  handleFilterChange = async ({ target }) => {
    const { value: id } = target;
    try {
      this.setState({ loading: true });

      this.stopScanPolling();

      const { data } = await getState(parseInt(id));
      const scans = this.usesScanList(id)
        ? (await getReturnedProductScans(parseInt(id))).data
        : [];

      this.setState({ data, selectedTransactionType: id });
      this.setScannedBoards(scans);

      if (this.usesScanList(id)) this.startScanPolling();
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      data,
      scannedBoards,
      sortColumn,
      loading,
      authorized,
      fields,
      errors,
      selectedTransactionType,
    } = this.state;
    const { t } = this.props;

    return (
      <>
        <div className="row mb-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="col">
            {this.renderSelect(
              "Qaerga?",
              this.filters,
              "",
              this.handleFilterChange,
              undefined,
              undefined,
              t("export.destinationLabel")
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "export",
              "",
              "",
              fields.export,
              this.handleInputChange,
              errors.export,
              true,
              "text",
              this.barcodeRef,
              false,
              this.handleExportKeyPress
            )}
          </div>
        </div>

        {this.excelExportTransactionTypes.includes(
          parseInt(selectedTransactionType)
        ) && (
          <div className="row mb-4">
            <div className="col">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="mb-0">
                  {t("export.scannedBoardsTitle")} ({scannedBoards.length})
                </h5>
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={scannedBoards.length === 0}
                  onClick={this.handleExportToExcel}
                >
                  {t("export.exportToExcelButton")}
                </button>
              </div>
              <ScannedBoardsTable
                rows={scannedBoards}
                onRemove={this.handleRemoveScanned}
              />
            </div>
          </div>
        )}

        <div className="row mb-4">
          <div className="col">
            <ReturnedProductExportTable
              rows={data}
              onSort={this.handleSort}
              sortColumn={sortColumn}
              onDelete={this.handleDelete}
              authorized={authorized}
              transactionType={selectedTransactionType}
            />
          </div>
        </div>
      </>
    );
  }
}

export default withTranslation("returnProduct")(ReturnProductExport);
