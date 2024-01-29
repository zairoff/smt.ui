import React from "react";
import { toast } from "react-toastify";
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
import { getModelByBarcode } from "../../services/modelService";

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
    filters: [
      { id: 2, name: "REMONTDAN CHIQISH (OMBORGA)" },
      { id: 3, name: "REMONTDAN CHIQISH (OMBOR, UTILIZATSIYAGA)" },
      { id: 4, name: "OMBORDAN CHIQISH (ZAVODGA)" },
      { id: 6, name: "OMBORDAN CHIQISH (UTILIZATSIYAGA)" },
      { id: 5, name: "BUFFERDAN CHIQISH (REMONTGA)" },
    ],
    selectedTransactionType: "",
    fields: { export: "" },
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  handleExportKeyPress = async (e) => {
    if (e.key === "Enter") {
      try {
        let count = 0;
        const barcode = e.target.value;
        const { selectedTransactionType, data } = this.state;
        const fiveLetterCode = barcode.substring(0, 5);

        if (barcode.length == 14 && !barcode.includes("-")) {
          count = 1;
        }

        if (count === "" || count == 0 || fiveLetterCode === "") {
          toast.warning("BARCODE BOTO'G'RI");
          return;
        }

        this.setState({
          loading: true,
          fields: { export: "" },
        });

        const { data: model } = await getModelByBarcode(fiveLetterCode);
        if (model === "" || model === undefined) {
          toast.warning("MODEL TOPILMADI");
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
          toast.warning("MODEL TOPILMADI");
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
      filters,
      fields,
      errors,
      selectedTransactionType,
    } = this.state;

    return (
      <>
        <div className="row mb-4">
          {loading && (
            <ReactLoading className="loading" type="spin" color="blue" />
          )}
          <div className="col">
            {this.renderSelect("Qaerga?", filters, "", this.handleFilterChange)}
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

export default ReturnProductExport;
