import Form from "../forms/form";
import _ from "lodash";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { withTranslation } from "react-i18next";
import { useParams, useLocation } from "react-router-dom";
import { exportReadyProductTransaction } from "../../services/readyProductTransactionService";

class ReadyProducExportDetailForm extends Form {
  state = {
    modelId: "",
    name: "",
    sapCode: "",
    count: "",
    fields: { count: "" },
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { model, count } = data;
    this.setState({
      modelId: model.id,
      name: model.name,
      sapCode: model.sapCode,
      count,
      fields: {
        count: "",
      },
      loading: false,
    });
  }

  handleSubmit = async () => {
    const { fields, count, modelId } = this.state;
    const { t } = this.props;

    if (
      modelId === "" ||
      modelId === undefined ||
      count === "" ||
      count === undefined
    ) {
      toast.warning(t("exportDetailForm.modelNotFound"));
      return;
    }
    if (fields.count === "" || fields.count === undefined) {
      toast.warning(t("exportDetailForm.enterExportQuantity"));
      return;
    }

    if (count < fields.count) {
      toast.warning(t("exportDetailForm.exportExceedsWarehouse"));
      return;
    }
    try {
      this.setState({ loading: true });
      const readyProductUpdate = {
        modelId: modelId,
        count: fields.count,
      };
      await exportReadyProductTransaction(readyProductUpdate);
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

const TranslatedReadyProducExportDetailForm = withTranslation([
  "readyProduct",
  "common",
])(ReadyProducExportDetailForm);

export default () => (
  <TranslatedReadyProducExportDetailForm
    params={useParams()}
    location={useLocation()}
  />
);
