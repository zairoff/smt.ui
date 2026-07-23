import Form from "./form";
import _ from "lodash";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
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
      toast.warning(this.props.t("forms:messages.fillRequiredFields"));
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
      toast.success(this.props.t("forms:messages.updatedSuccessfully"));
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.message);
    }
  };

  render() {
    const { t } = this.props;
    const { fields, errors, loading, productBrand } = this.state;
    return (
      <>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="row">
          <div className="col-4">
            {this.renderInput(
              "name",
              t("forms:model.name"),
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
              t("forms:model.barcode"),
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
              t("forms:model.sapCode"),
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
              t("forms:model.boardId"),
              "",
              fields.boardId,
              this.handleInputChange,
              errors.boardId,
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

const TranslatedModelEditForm = withTranslation(["forms", "common"])(
  ModelEditForm
);

export default () => (
  <TranslatedModelEditForm params={useParams()} location={useLocation()} />
);
