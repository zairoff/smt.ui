import Form from "./form";
import _ from "lodash";
import { toast } from "react-toastify";
import ReactLoading from "react-loading";
import { useParams, useLocation } from "react-router-dom";
import { updateModel } from "../../services/modelService";

class ModelEditForm extends Form {
  state = {
    fields: {
      id: "",
      name: "",
      barcode: "",
      sapCode: "",
      boardId: "",
    },
    productBrand: {},
    brandId: "",
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { id, name, barcode, sapCode, boardId, productBrand } = data;
    this.setState({
      fields: {
        id,
        name,
        barcode,
        sapCode,
        boardId,
      },
      productBrand,
      loading: false,
    });
  }

  handleSubmit = async () => {
    const { fields } = this.state;
    const { id, name, barcode, sapCode, boardId } = fields;

    if (
      name === "" ||
      name === undefined ||
      barcode === "" ||
      barcode === undefined ||
      sapCode === "" ||
      sapCode === undefined ||
      boardId === "" ||
      boardId === undefined
    ) {
      toast.warning("Kerakli ma'lumotlarni kiriting");
      return;
    }
    try {
      this.setState({ loading: true });
      const modelUpdate = {
        name,
        barcode,
        sapCode,
        boardId,
      };
      await updateModel(id, modelUpdate);
      this.setState({ loading: false });
      toast.success("Muvaffaqiyatli o'zgartirildi");
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.message);
    }
  };

  render() {
    const { fields, errors, loading, productBrand } = this.state;
    return (
      <>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="row">
          <div className="col-4">
            {this.renderInput(
              "name",
              "Model",
              "",
              fields.name,
              this.handleInputChange,
              errors.name,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "barcode",
              "Barcode",
              "",
              fields.barcode,
              this.handleInputChange,
              errors.barcode,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "sapCode",
              "Sap code",
              "",
              fields.sapCode,
              this.handleInputChange,
              errors.sapCode,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "boardId",
              "BoardID",
              "",
              fields.boardId,
              this.handleInputChange,
              errors.boardId,
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
  <ModelEditForm params={useParams()} location={useLocation()} />
);
