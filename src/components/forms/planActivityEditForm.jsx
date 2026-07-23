import Form from "./form";
import _ from "lodash";
import { toast } from "react-toastify";
import { withTranslation } from "react-i18next";
import ReactLoading from "react-loading";
import { useParams, useLocation } from "react-router-dom";
import { updatePlanActivity } from "../../services/planActivityService";

class PlanActivityEditForm extends Form {
  state = {
    fields: {
      activityId: "",
      line: "",
      issue: "",
      reason: "",
      action: "",
      responsible: "",
      status: "",
      createdDate: "",
      expireDate: "",
    },
    data: [],
    errors: {},
    loading: true,
  };

  async componentDidMount() {
    const { data } = this.props.location.state;
    const { issue, reason, act, responsible, date, expires, line, id } = data;
    this.setState({
      fields: {
        activityId: id,
        issue,
        reason,
        action: act,
        responsible,
        createdDate: date,
        expireDate: expires,
        line: line.name,
      },
      loading: false,
    });
  }

  handleSelectChange = async ({ target }) => {
    const { value: id } = target;
    const { fields } = this.state;
    fields.status = id;
    this.setState({ fields });
  };

  handleSubmit = async () => {
    const { fields } = this.state;
    const { reason, issue, responsible, status, action, activityId } = fields;

    if (
      reason === "" ||
      reason === undefined ||
      issue === "" ||
      issue === undefined ||
      responsible === "" ||
      responsible === undefined ||
      status === "" ||
      status === undefined
    ) {
      toast.warning(this.props.t("forms:messages.fillRequiredFields"));
      return;
    }
    try {
      this.setState({ loading: true });
      const planActivity = {
        reason: reason,
        issue: issue,
        act: action,
        responsible: responsible,
        status: status,
      };
      await updatePlanActivity(activityId, planActivity);
      this.setState({ loading: false });
      toast.success(this.props.t("forms:messages.updatedSuccessfully"));
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.title);
    }
  };

  render() {
    const { t } = this.props;
    const { fields, errors, loading } = this.state;

    const statuses = [
      { id: "Plan", name: t("forms:planActivity.statuses.plan") },
      { id: "Plan-Do", name: t("forms:planActivity.statuses.planDo") },
      { id: "Plan-Do-Act", name: t("forms:planActivity.statuses.planDoAct") },
      {
        id: "Plan-Do-Act-Resolve",
        name: t("forms:planActivity.statuses.planDoActResolve"),
      },
    ];

    return (
      <>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="row">
          <div className="col-4">
            {this.renderInput(
              "line",
              t("forms:fields.line"),
              "",
              fields.line,
              null,
              errors.line,
              true,
              "",
              null,
              true
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "issue",
              t("forms:planActivity.issue"),
              "",
              fields.issue,
              this.handleInputChange,
              errors.issue,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "reason",
              t("forms:planActivity.reason"),
              "",
              fields.reason,
              this.handleInputChange,
              errors.reason,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "action",
              t("forms:planActivity.action"),
              "",
              fields.action,
              this.handleInputChange,
              errors.action,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "responsible",
              t("forms:planActivity.responsible"),
              "",
              fields.responsible,
              this.handleInputChange,
              errors.responsible,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderSelect(
              "Status",
              statuses,
              "",
              this.handleSelectChange,
              "id",
              "name",
              t("forms:fields.status")
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

const TranslatedPlanActivityEditForm = withTranslation(["forms", "common"])(
  PlanActivityEditForm
);

export default () => (
  <TranslatedPlanActivityEditForm
    params={useParams()}
    location={useLocation()}
  />
);
