import React from "react";
import { loginUser } from "../../services/userService";
import ReactLoading from "react-loading";
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
    const { fields, errors, loading } = this.state;
    return (
      <div className="d-flex justify-content-center align-items-center p-4">
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <form onSubmit={this.handleSubmit}>
          {this.renderInput(
            "username",
            "Username",
            "",
            fields.username,
            this.handleInputChange,
            errors.username,
            true
          )}
          <p className="mt-2"> </p>
          {this.renderInput(
            "password",
            "Password",
            "",
            fields.password,
            this.handleInputChange,
            errors.password,
            true,
            "password"
          )}
          {this.renderLink(
            "forgot password?",
            "/reset",
            "d-flex justify-content-end"
          )}
          <p className="mt-2"> </p>
          {this.renderButton("Login")}
        </form>
      </div>
    );
  }
}

export default Login;
