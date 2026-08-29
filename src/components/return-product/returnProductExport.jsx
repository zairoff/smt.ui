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
import {
  getModelByBarcode,
  getModelBySapCode,
} from "../../services/modelService";

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

        const { data: model } =
          sapCode != "" && count != 0
            ? getModelBySapCode
            : await getModelByBarcode(fiveLetterCode);
        if (model === "" || model === undefined) {
          toast.warning(t("errors.modelNotFound"));
          return;
        }

        const currentModel = data.filter((x) => x.model.id == model.id);

        console.log("currentModel", currentModel);
        console.log("selectedTransactionType", selectedTransactionType);

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
          TransactionType: parseInt(selectedTransactionType), // ImportFromFactoryToBuffer
        };

        await exportReturnedProduct(returnedProductTransaction);

        const { data: newData } = await getState(
          parseInt(selectedTransactionType)
        );

        this.setState({
          fields: {
            export: "",
          },
          data: newData,
          loading: false,
        });
      } catch (ex) {
        toast.error(ex.response.data.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  async componentDidMount() {
    const { user } = this.props;
    this.setState({ authorized: user != null });
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

      const { data } = await getState(parseInt(id));

      this.setState({ data, selectedTransactionType: id });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const {
      data,
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
            <p className="mt-2"> </p>
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
