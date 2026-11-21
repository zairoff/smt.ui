import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  getStaff,
  createStaff,
  resetStaffPassword,
  deleteStaff,
  setStaffTitle,
} from "../../services/documentService";
import { userHasRole } from "../../services/authToken";

function errorMessage(ex, fallback) {
  return (ex.response && ex.response.data && ex.response.data.message) || fallback;
}

// Admin page: who has a document folder. Adding someone creates their login
// (or gives an existing login a folder); removing deletes the login but keeps
// their files on the server.
class DocumentStaff extends Component {
  state = {
    staff: [],
    form: { title: "", username: "", password: "", isAdmin: false },
    saving: false,
    error: null,
    notice: null,
  };

  componentDidMount() {
    if (userHasRole(this.props.user, "admin")) this.load();
  }

  load = async () => {
    const { t } = this.props;
    try {
      const { data: staff } = await getStaff();
      this.setState({ staff });
    } catch (ex) {
      this.setState({ error: errorMessage(ex, t("errors.generic")) });
    }
  };

  setField = (name, value) =>
    this.setState((s) => ({ form: { ...s.form, [name]: value } }));

  submit = async (e) => {
    e.preventDefault();
    const { t } = this.props;
    const { form } = this.state;
    this.setState({ saving: true, error: null, notice: null });
    try {
      const { data } = await createStaff({ ...form, username: form.username.trim() });
      this.setState({
        form: { title: "", username: "", password: "", isAdmin: false },
        notice: data.existingAccount
          ? t("staff.addedExisting", { name: data.username })
          : t("staff.added", { name: data.username }),
      });
      this.load();
    } catch (ex) {
      this.setState({ error: errorMessage(ex, t("errors.generic")) });
    } finally {
      this.setState({ saving: false });
    }
  };

  renameTitle = async (staffMember) => {
    const { t } = this.props;
    const title = window.prompt(
      t("staff.renameTitlePrompt", { name: staffMember.username }),
      staffMember.title || ""
    );
    if (title === null) return;
    this.setState({ error: null, notice: null });
    try {
      await setStaffTitle(staffMember.username, title);
      this.load();
    } catch (ex) {
      this.setState({ error: errorMessage(ex, t("errors.generic")) });
    }
  };

  resetPassword = async (username) => {
    const { t } = this.props;
    const password = window.prompt(t("staff.newPasswordPrompt", { name: username }));
    if (!password) return;
    this.setState({ error: null, notice: null });
    try {
      await resetStaffPassword(username, password);
      this.setState({ notice: t("staff.passwordChanged", { name: username }) });
    } catch (ex) {
      this.setState({ error: errorMessage(ex, t("errors.generic")) });
    }
  };

  remove = async (username) => {
    const { t } = this.props;
    if (!window.confirm(t("staff.removeConfirm", { name: username }))) return;
    this.setState({ error: null, notice: null });
    try {
      await deleteStaff(username);
      this.setState({ notice: t("staff.removed", { name: username }) });
      this.load();
    } catch (ex) {
      this.setState({ error: errorMessage(ex, t("errors.generic")) });
    }
  };

  render() {
    const { t, user } = this.props;
    const { staff, form, saving, error, notice } = this.state;

    if (!userHasRole(user, "admin"))
      return <div className="alert alert-warning">{t("staff.adminOnly")}</div>;

    const me = user.username;

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">{t("staff.title")}</h3>
          <Link to="/documents" className="btn btn-outline-secondary btn-sm">
            {t("title")}
          </Link>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}

        <form className="card card-body mb-4" onSubmit={this.submit}>
          <h5>{t("staff.add")}</h5>
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">{t("staff.folderTitle")}</label>
              <input
                className="form-control"
                placeholder={t("staff.folderTitlePlaceholder")}
                value={form.title}
                onChange={(e) => this.setField("title", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">{t("staff.username")}</label>
              <input
                className="form-control"
                value={form.username}
                onChange={(e) => this.setField("username", e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">{t("staff.password")}</label>
              <input
                className="form-control"
                type="text"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => this.setField("password", e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <div className="form-check">
                <input
                  id="staff-admin"
                  className="form-check-input"
                  type="checkbox"
                  checked={form.isAdmin}
                  onChange={(e) => this.setField("isAdmin", e.target.checked)}
                />
                <label className="form-check-label" htmlFor="staff-admin">
                  {t("staff.admin")}
                </label>
              </div>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100" disabled={saving}>
                {t("staff.addButton")}
              </button>
            </div>
          </div>
          <div className="form-text">{t("staff.passwordHint")}</div>
        </form>

        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>{t("staff.folderTitle")}</th>
              <th>{t("staff.username")}</th>
              <th>{t("staff.role")}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted">{t("noStaff")}</td>
              </tr>
            )}
            {staff.map((s) => (
              <tr key={s.username}>
                <td>{s.title || s.username}</td>
                <td>{s.username}</td>
                <td>{s.isAdmin ? t("staff.admin") : t("staff.engineer")}</td>
                <td className="text-end text-nowrap">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm me-1"
                    onClick={() => this.renameTitle(s)}
                  >
                    {t("staff.renameTitle")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm me-1"
                    onClick={() => this.resetPassword(s.username)}
                  >
                    {t("staff.resetPassword")}
                  </button>
                  {s.username.toLowerCase() !== (me || "").toLowerCase() && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => this.remove(s.username)}
                    >
                      {t("staff.remove")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="form-text">{t("staff.reloginHint")}</div>
      </div>
    );
  }
}

export default withTranslation("documents")(DocumentStaff);
