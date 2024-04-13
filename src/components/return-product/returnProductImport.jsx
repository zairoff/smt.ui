import React from "react";
import ReactLoading from "react-loading";
import _ from "lodash";
import Form from "../forms/form";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  getModelByBarcode,
  getModelBySapCode,
} from "../../services/modelService";
import ReadyProductImportTable from "../tables/readyProductImportTable";
import {
  deleteReturnedProductTransaction,
  getReturnedProductByDate,
  importReturnedProduct,
} from "../../services/returnedProductTransactionService";
import ReturnedProductImportTable from "../tables/ReturnedProductImportTable";

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

class ReturnProductImport extends Form {
  barcodeRef = React.createRef();

  state = {
    sortColumn: { path: "", order: "asc" },
    fields: { import: "" },
    imports: [],
    errors: {},
    loading: false,
    authorized: false,
  };

  componentDidUpdate() {
    this.setFocusOnBarcode();
  }

  setFocusOnBarcode() {
    this.barcodeRef.current.focus();
  }

  async componentDidMount() {
    const { user } = this.props;
    this.setState({ loading: true, authorized: user != null });
    try {
      const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReturnedProductByDate(today, 1); // ImportFromFactoryToBuffer
      const imports = data.map((obj, index) => ({
        ...obj,
        index: index + 1,
      }));
      this.setState({ imports });
    } catch (ex) {
      toast(ex.response.data.message);
    } finally {
      this.setState({ loading: false });
    }
  }

  handleDelete = async ({ id }) => {
    const { imports } = this.state;
    this.setState({ loading: true });

    try {
      await deleteReturnedProductTransaction(id);
      const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
      const { data } = await getReturnedProductByDate(today, 1);
      const imports = data.map((obj, index) => ({
        ...obj,
        index: index + 1,
      }));
      this.setState({ loading: false, imports });
    } catch (ex) {
      this.setState({ imports });
      this.catchExceptionMessage(ex, "import");
    } finally {
      this.setState({ loading: false });
    }
  };

  currentPageCheck(data) {}

  handleSort = (sortColumn) => {};

  handlePageChange = (page) => {};

  handleImportKeyPress = async (e) => {
    if (e.key === "Enter") {
      this.setState({
        loading: true,
        fields: { import: "" },
      });
      const barcode = e.target.value;
      const { selectedImportType } = this.state;
      //3ACOP----10
      // SSBSMT32/0026----30
      try {
        let count = 0;
        let sapCode = "";
        let fiveLetterCode = "";

        if (
          barcode.length == 14 &&
          !barcode.includes("-") &&
          !barcode.includes("/")
        ) {
          fiveLetterCode = barcode.substring(0, 5);
          count = 1;
        }

        if (barcode.includes("-") && !barcode.includes("/")) {
          fiveLetterCode = barcode.substring(0, 5);
          const indexOf = barcode.indexOf("-");
          count = barcode.substring(indexOf + 4, barcode.length);
        }

        if (count === "" || count == 0 || fiveLetterCode === "") {
          const indexOf = barcode.indexOf("-");
          sapCode = barcode.substring(0, indexOf);
          count = barcode.substring(indexOf + 4, barcode.length);

          console.log(sapCode);
          console.log(count);

          if (count === "" || sapCode === "") {
            return;
          }
        }

        const { data: model } =
          sapCode != "" && count != 0
            ? await getModelBySapCode(sapCode)
            : await getModelByBarcode(fiveLetterCode);

        if (model === "" || model === undefined) {
          return;
        }

        const returnedProductCreate = {
          barcode,
          modelId: model.id,
          count,
          TransactionType: 1, // ImportFromFactoryToBuffer
        };

        await importReturnedProduct(returnedProductCreate);

        const today = format(new Date(), "yyyy-MM-dd HH:mm:ss");
        const { data } = await getReturnedProductByDate(
          today,
          1 // ImportFromFactoryToBuffer
        );

        const imports = data.map((obj, index) => ({
          ...obj,
          index: index + 1,
        }));

        if (Object.keys(imports).length > 0) {
          this.setState({
            fields: {
              import: "",
            },
            imports,
            loading: false,
          });
        }
      } catch (ex) {
        toast.error(ex.response.data.message);
      } finally {
        this.setState({ loading: false });
      }
    }
  };

  render() {
    const { imports, sortColumn, loading, fields, errors, authorized } =
      this.state;
    return (
      <div className="row">
        {loading && (
          <ReactLoading className="loading" type="spin" color="blue" />
        )}

        <div className="col">
          <button className="btn p-2 btn-primary fw-bold">
            QAYTGAN MAXSULOTLAR
          </button>
          {this.renderInput(
            "import",
            "",
            "",
            fields.import,
            this.handleInputChange,
            errors.import,
            true,
            "text",
            this.barcodeRef,
            false,
            this.handleImportKeyPress
          )}
          <p className="mt-2"> </p>
          <ReturnedProductImportTable
            rows={imports}
            onSort={this.handleSort}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            authorized={authorized}
          />
        </div>
      </div>
    );
  }
}

export default ReturnProductImport;
