import Form from "../forms/form";
import _ from "lodash";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { withTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import {
  exportReturnedProduct,
  importReturnedProduct,
} from "../../services/returnedProductTransactionService";

class ReturnProducExportDetail extends Form {
  state = {
    modelId: "",
    name: "",
    sapCode: "",
    barCode: "",
    count: "",
    fields: { count: "" },
    errors: {},
    loading: true,
    transactionType: "",
  };

  async componentDidMount() {
    const { data, transactionType } = this.props.location.state;
    console.log(data);
    console.log(transactionType);
    const { model, count } = data;
    this.setState({
      modelId: model.id,
      name: model.name,
      sapCode: model.sapCode,
      barCode: model.barcode,
      transactionType,
      count,
      fields: {
        count: "",
      },
      loading: false,
    });
  }

  handleSubmit = async () => {
    const { fields, count, modelId, transactionType } = this.state;
    const { t } = this.props;

    if (
      modelId === "" ||
      modelId === undefined ||
      count === "" ||
      count === undefined
    ) {
      toast.warning(t("errors.modelNotFound"));
      return;
    }

    if (fields.count === "" || fields.count === undefined) {
      toast.warning(t("errors.enterExportQuantity"));
      return;
    }

    if (count < fields.count) {
      toast.warning(t("errors.exportExceedsWarehouse"));
      return;
    }
    try {
      this.setState({ loading: true });

      const returnedProductTransaction = {
        modelId: modelId,
        count: fields.count,
        TransactionType: parseInt(transactionType),
      };
      await exportReturnedProduct(returnedProductTransaction);
      this.setState({
        loading: false,
        name: "",
        sapCode: "",
        barCode: "",
        modelId: "",
        count: "",
        fields: { count: "" },
      });
      toast.success(t("updateSuccess"));
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.title);
    }
  };

  render() {
    const { fields, errors, loading, name, count, sapCode, barCode } =
      this.state;
    const { t } = this.props;
    return (
      <>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="row">
          <div className="col-4">
            {this.renderInput(
              "model",
              t("fields.model"),
              "",
              name,
              null,
              errors.model,
              true,
              "",
              null,
              true
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "sapCode",
              t("fields.sapCode"),
              "",
              sapCode,
              null,
              errors.sapCode,
              true,
              "",
              null,
              true
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "barcode",
              t("fields.barCode"),
              "",
              barCode,
              null,
              errors.barCode,
              true,
              "",
              null,
              true
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "o-count",
              t("fields.warehouseQuantity"),
              "",
              count,
              null,
              errors.ocount,
              true,
              "",
              null,
              true
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "count",
              t("fields.exportQuantity"),
              "",
              fields.count,
              this.handleInputChange,
              errors.count,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderButton(
              t("common:buttons.save"),
              "button",
              this.handleSubmit
            )}
          </div>
        </div>
      </>
    );
  }
}

const TranslatedReturnProducExportDetail = withTranslation([
  "returnProduct",
  "common",
])(ReturnProducExportDetail);

export default () => (
  <TranslatedReturnProducExportDetail
    params={useParams()}
    location={useLocation()}
  />
);
