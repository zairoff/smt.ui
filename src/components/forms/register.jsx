import React from "react";
import { loginUser, registerUser } from "../../services/userService";
import ReactLoading from "react-loading";
import { withTranslation } from "react-i18next";
import Form from "./form";
import { toast } from "react-toastify";

class Register extends Form {
  state = {
    fields: { username: "", password: "", passwordRepeat: "", telegram: "" },
    errors: {},
    loading: false,
  };

  validateInput() {
    const { password, passwordRepeat } = this.state.fields;
    if (password !== passwordRepeat)
      return this.props.t("forms:register.passwordMismatch");
  }

  doSubmit = async () => {
    const error = this.validateInput();
    if (error) {
      toast(error);
      return;
    }
    this.setState({ loading: true });
    try {
      await registerUser(this.state.fields);
      const { username, password } = this.state.fields;
      const user = { username: username, password: password };
      const { data } = await loginUser(user);
      localStorage.setItem("token", data.token);
      window.location = "/dashboard";
    } catch (ex) {
      this.catchExceptionMessage(ex, "username");
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { t } = this.props;
    const { fields, errors, loading } = this.state;

    return (
      <React.Fragment>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="d-flex justify-content-center align-items-center p-4">
          <form onSubmit={this.handleSubmit}>
            <p className="mt-2"> </p>
            {this.renderInput(
              "username",
              t("forms:register.username"),
              "", // placeholder
              fields.username,
              this.handleInputChange,
              errors.username,
              true
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "password",
              t("forms:register.password"),
              "", // placeholder
              fields.password,
              this.handleInputChange,
              errors.password,
              true,
              "password"
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "passwordRepeat",
              t("forms:register.confirmPassword"),
              "", // placeholder
              fields.passwordRepeat,
              this.handleInputChange,
              errors.passwordRepeat,
              true,
              "password"
            )}
            <p className="mt-2"> </p>
            {this.renderButton(t("forms:register.submit"))}
          </form>
        </div>
      </React.Fragment>
    );
  }
}

export default withTranslation("forms")(Register);
