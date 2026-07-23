import React from "react";
import { loginUser } from "../../services/userService";
import ReactLoading from "react-loading";
import { withTranslation } from "react-i18next";
import Form from "./form";

class Login extends Form {
  state = {
    fields: { username: "", password: "" },
    loading: false,
    errors: {},
  };

  doSubmit = async () => {
    this.setState({ loading: true });
    const { fields: user } = this.state;
    try {
      const { data } = await loginUser(user);
      localStorage.setItem("token", data.token);
      window.location.href = "./dashboard";
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
      <div className="d-flex justify-content-center align-items-center p-4">
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <form onSubmit={this.handleSubmit}>
          {this.renderInput(
            "username",
            t("forms:login.username"),
            "",
            fields.username,
            this.handleInputChange,
            errors.username,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "password",
            t("forms:login.password"),
            "",
            fields.password,
            this.handleInputChange,
            errors.password,
            true,
            "password"
          )}
          {this.renderLink(
            t("forms:login.forgotPassword"),
            "/reset",
            "d-flex justify-content-end"
          )}
          <p className="mt-2"> </p>
          {this.renderButton(t("forms:login.submit"))}
        </form>
      </div>
    );
  }
}

export default withTranslation("forms")(Login);
