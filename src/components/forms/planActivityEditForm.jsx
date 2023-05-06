import Form from "./form";
import _ from "lodash";
import { toast } from "react-toastify";
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
    statuses: [
      { id: "Plan", name: "Plan" },
      { id: "Plan-Do", name: "Plan-Do" },
      { id: "Plan-Do-Act", name: "Plan-Do-Act" },
      { id: "Plan-Do-Act-Resolve", name: "Plan-Do-Act-Resolve" },
    ],
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
      toast.warning("Kerakli ma'lumotlarni kiriting");
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
      toast.success("Muvaffaqiyatli o'zgartirildi");
    } catch (ex) {
      this.setState({ loading: false });
      console.log(ex.response);
      toast.error(ex.response.data.title);
    }
  };

  render() {
    const { fields, errors, loading, statuses } = this.state;
    return (
      <>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="row">
          <div className="col-4">
            {this.renderInput(
              "line",
              "Line",
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
              "Nomuvofiqlik",
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
              "Sabab",
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
              "To'g'irlash ishlari",
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
              "Javobgar",
              "",
              fields.responsible,
              this.handleInputChange,
              errors.responsible,
              true,
              ""
            )}
            <p className="mt-2"> </p>
            {this.renderSelect("Status", statuses, "", this.handleSelectChange)}
            <p className="mt-2"> </p>
            {this.renderButton("Save", "button", this.handleSubmit)}
          </div>
        </div>
      </>
    );
  }
}

export default () => (
  <PlanActivityEditForm params={useParams()} location={useLocation()} />
);
