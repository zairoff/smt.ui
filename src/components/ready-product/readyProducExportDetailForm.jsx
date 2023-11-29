import Form from "../forms/form";
import _ from "lodash";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
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

    if (
      modelId === "" ||
      modelId === undefined ||
      count === "" ||
      count === undefined
    ) {
      toast.warning("MODEL TOPILMADI");
      return;
    }
    if (fields.count === "" || fields.count === undefined) {
      toast.warning("CHIQIM SONINI KIRITING");
      return;
    }

    if (count < fields.count) {
      toast.warning("CHIQIM SONINI OMBORDAGI MIQDORDAN KO'P BO'LMASLIGI KERAK");
      return;
    }
    try {
      this.setState({ loading: true });
      const readyProductUpdate = {
        modelId: modelId,
        count: fields.count,
      };
      await exportReadyProductTransaction(readyProductUpdate);
      this.setState({ loading: false, fields: { count: "" } });
      toast.success("Muvaffaqiyatli o'zgartirildi");
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.title);
    }
  };

  render() {
    const { fields, errors, loading, name, count, sapCode } = this.state;
    return (
      <>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="row">
          <div className="col-4">
            {this.renderInput(
              "model",
              "MODEL",
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
              "SAP CODE",
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
              "OMBORDAGI SONI",
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
              "CHIQIM SONI",
              "",
              fields.count,
              this.handleInputChange,
              errors.count,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderButton("Save", "button", this.handleSubmit)}
          </div>
        </div>
      </>
    );
  }
}

export default () => (
  <ReadyProducExportDetailForm params={useParams()} location={useLocation()} />
);
