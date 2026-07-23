import Form from "../forms/form";
import _ from "lodash";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { withTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import { changeReadyProductTransaction } from "../../services/readyProductTransactionService";

class ReadyProductTransactionsDetailed extends Form {
  state = {
    modelId: "",
    name: "",
    sapCode: "",
    count: "",
    fields: { count: "" },
    errors: {},
    loading: true,
    transactionId: "",
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { model, count, id } = data;
    this.setState({
      modelId: model.id,
      name: model.name,
      sapCode: model.sapCode,
      transactionId: id,
      count,
      fields: {
        count: "",
      },
      loading: false,
    });
  }

  handleSubmit = async () => {
    const { fields, count, transactionId } = this.state;
    const { t } = this.props;

    if (
      transactionId === "" ||
      transactionId === undefined ||
      count === "" ||
      count === undefined
    ) {
      toast.warning(t("transactionsDetailed.transactionNotFound"));
      return;
    }
    if (fields.count === "" || fields.count === undefined) {
      toast.warning(t("transactionsDetailed.enterNewQuantity"));
      return;
    }

    try {
      this.setState({ loading: true });
      await changeReadyProductTransaction(transactionId, fields.count);
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
    const { fields, errors, loading, name, count, sapCode } = this.state;
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

const TranslatedReadyProductTransactionsDetailed = withTranslation([
  "readyProduct",
  "common",
])(ReadyProductTransactionsDetailed);

export default () => (
  <TranslatedReadyProductTransactionsDetailed
    params={useParams()}
    location={useLocation()}
  />
);
