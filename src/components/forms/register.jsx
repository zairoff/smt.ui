import React from "react";
import { loginUser, registerUser } from "../../services/userService";
import ReactLoading from "react-loading";
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
    if (password !== passwordRepeat) return "Password does not match";
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
    const { fields, errors, loading } = this.state;

    return (
      <React.Fragment>
        {loading && <ReactLoading className="test" type="spin" color="blue" />}
        <div className="d-flex justify-content-center align-items-center p-4">
          <form onSubmit={this.handleSubmit}>
            <p className="mt-2"> </p>
            {this.renderInput(
              "username",
              "Username",
              "", // placeholder
              fields.username,
              this.handleInputChange,
              errors.username,
              true
            )}
            <p className="mt-2"> </p>
            {this.renderInput(
              "password",
              "Password",
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
              "Confirm password",
              "", // placeholder
              fields.passwordRepeat,
              this.handleInputChange,
              errors.passwordRepeat,
              true,
              "password"
            )}
            <p className="mt-2"> </p>
            {this.renderButton("Register")}
          </form>
        </div>
      </React.Fragment>
    );
  }
}

export default Register;
