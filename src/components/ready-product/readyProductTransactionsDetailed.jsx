import Form from "../forms/form";
import _ from "lodash";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
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

    if (
      transactionId === "" ||
      transactionId === undefined ||
      count === "" ||
      count === undefined
    ) {
      toast.warning("TRANSAKSIYA TOPILMADI");
      return;
    }
    if (fields.count === "" || fields.count === undefined) {
      toast.warning("O'ZGARUVCHI SONINI KIRITING");
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
  <ReadyProductTransactionsDetailed
    params={useParams()}
    location={useLocation()}
  />
);
