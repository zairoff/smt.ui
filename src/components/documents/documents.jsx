import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ReactLoading from "react-loading";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import {
  getOwners,
  listFolder,
  downloadFile,
  uploadFile,
  createFolder,
  renameEntry,
  deleteEntry,
} from "../../services/documentService";
import { userHasRole } from "../../services/authToken";
import FilePreview, { previewKind, tabType, MAX_INLINE_PREVIEW_BYTES } from "./filePreview";

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60 * 1000);
}

export function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function joinPath(path, name) {
  return path ? `${path}/${name}` : name;
}

function errorMessage(ex, fallback) {
  return (ex.response && ex.response.data && ex.response.data.message) || fallback;
}

// Staff document folders: every engineer has one folder they can change; all
// other folders are read-only for them. Admins can change every folder.
class Documents extends Component {
  state = {
    owners: [],
    owner: null,
    path: "",
    listing: null,
    loading: false,
    error: null,
    uploads: [], // [{ id, name, progress, error }]
    newFolder: null, // folder name being typed, or null when the box is closed
    renaming: null, // { name, value }
    dragOver: false,
    viewing: null, // { name, blob } shown in the preview dialog
    opening: null, // name of the file being fetched for preview
  };

  fileInput = React.createRef();

  async componentDidMount() {
    const { t } = this.props;
    try {
      const { data: owners } = await getOwners();
      const params = new URLSearchParams(window.location.search);
      const me = this.props.user && this.props.user.username;
      const wanted = params.get("owner");
      const owner =
        (owners.find((o) => o.username === wanted) ||
          owners.find((o) => o.username === me) ||
          owners[0] || { username: null }).username;
      this.setState({ owners });
      if (owner) this.open(owner, wanted === owner ? params.get("path") || "" : "");
    } catch (ex) {
      this.setState({ error: this.accessError(ex) || errorMessage(ex, t("errors.generic")) });
    }
  }

  accessError(ex) {
    const { t } = this.props;
    const status = ex.response && ex.response.status;
    if (status === 401) return t("errors.login");
    if (status === 403) return t("errors.noAccess");
    return null;
  }

  open = async (owner, path) => {
    const { t } = this.props;
    this.setState({ owner, path, loading: true, error: null, newFolder: null, renaming: null });
    // Keep the location in the URL so a folder link can be shared.
    const query = new URLSearchParams({ owner, ...(path ? { path } : {}) });
    window.history.replaceState(null, "", `${window.location.pathname}?${query}`);
    try {
      const { data: listing } = await listFolder(owner, path);
      // Ignore a slow answer for a folder the user already left.
      if (this.state.owner === owner && this.state.path === path)
        this.setState({ listing, loading: false });
    } catch (ex) {
      this.setState({
        listing: null,
        loading: false,
        error: this.accessError(ex) || errorMessage(ex, t("errors.generic")),
      });
    }
  };

  refresh = () => this.open(this.state.owner, this.state.path);

  // ---------- files ----------

  download = async (entry) => {
    const { t } = this.props;
    const { owner, path } = this.state;
    try {
      const { data } = await downloadFile(owner, joinPath(path, entry.name));
      saveBlob(data, entry.name);
    } catch (ex) {
      this.setState({ error: this.accessError(ex) || t("errors.download") });
    }
  };

  preview = (entry) => {
    if (previewKind(entry.name) === "tab") return this.previewInTab(entry);
    return this.previewInPage(entry);
  };

  // Excel, Word and text files are parsed in the browser and shown in a dialog.
  previewInPage = async (entry) => {
    const { t } = this.props;
    const { owner, path } = this.state;
    if (entry.size > MAX_INLINE_PREVIEW_BYTES)
      return this.setState({ error: t("preview.tooLarge", { maxMb: MAX_INLINE_PREVIEW_BYTES / 1024 / 1024 }) });

    this.setState({ opening: entry.name });
    try {
      const { data } = await downloadFile(owner, joinPath(path, entry.name));
      this.setState({ viewing: { name: entry.name, blob: data }, opening: null });
    } catch (ex) {
      this.setState({ opening: null, error: this.accessError(ex) || t("errors.download") });
    }
  };

  // PDFs, images and video open in the browser's own viewer.
  previewInTab = async (entry) => {
    const { t } = this.props;
    const { owner, path } = this.state;
    // Open the tab now, inside the click, or the popup blocker stops it.
    const tab = window.open("", "_blank");
    try {
      const { data } = await downloadFile(owner, joinPath(path, entry.name));
      const blob = new Blob([data], { type: tabType(entry.name) });
      const url = URL.createObjectURL(blob);
      if (tab) tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
    } catch (ex) {
      if (tab) tab.close();
      this.setState({ error: this.accessError(ex) || t("errors.download") });
    }
  };

  uploadFiles = async (files) => {
    const { owner, path } = this.state;
    // One request per file: per-file progress and a per-file "replace?" question.
    for (const file of Array.from(files)) {
      await this.uploadOne(owner, path, file, false);
    }
    if (this.state.owner === owner && this.state.path === path) this.refresh();
  };

  uploadOne = async (owner, path, file, overwrite) => {
    const { t } = this.props;
    const id = `${Date.now()}-${Math.random()}`;
    const update = (changes) =>
      this.setState((s) => ({
        uploads: s.uploads.map((u) => (u.id === id ? { ...u, ...changes } : u)),
      }));
    this.setState((s) => ({ uploads: [...s.uploads, { id, name: file.name, progress: 0 }] }));

    try {
      await uploadFile(owner, path, file, overwrite, (progress) => update({ progress }));
      this.setState((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) }));
    } catch (ex) {
      const status = ex.response && ex.response.status;
      if (status === 409 && !overwrite) {
        this.setState((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) }));
        if (window.confirm(t("replaceConfirm", { name: file.name })))
          await this.uploadOne(owner, path, file, true);
        return;
      }
      const message =
        status === 413
          ? t("errors.tooLarge", { maxMb: (ex.response.data && ex.response.data.maxMb) || "?" })
          : this.accessError(ex) || errorMessage(ex, t("errors.upload"));
      update({ error: message });
    }
  };

  dismissUpload = (id) =>
    this.setState((s) => ({ uploads: s.uploads.filter((u) => u.id !== id) }));

  handleDrop = (e) => {
    e.preventDefault();
    this.setState({ dragOver: false });
    if (this.canEdit() && e.dataTransfer.files.length) this.uploadFiles(e.dataTransfer.files);
  };

  handleDragOver = (e) => {
    if (!this.canEdit()) return;
    e.preventDefault();
    if (!this.state.dragOver) this.setState({ dragOver: true });
  };

  // ---------- folders / rename / delete ----------

  submitNewFolder = async (e) => {
    e.preventDefault();
    const { t } = this.props;
    const { owner, path, newFolder } = this.state;
    if (!newFolder || !newFolder.trim()) return;
    try {
      await createFolder(owner, path, newFolder.trim());
      this.refresh();
    } catch (ex) {
      this.setState({ error: this.accessError(ex) || errorMessage(ex, t("errors.generic")) });
    }
  };

  submitRename = async (e) => {
    e.preventDefault();
    const { t } = this.props;
    const { owner, path, renaming } = this.state;
    const value = renaming.value.trim();
    if (!value || value === renaming.name) return this.setState({ renaming: null });
    try {
      await renameEntry(owner, joinPath(path, renaming.name), value);
      this.refresh();
    } catch (ex) {
      this.setState({ error: this.accessError(ex) || errorMessage(ex, t("errors.generic")) });
    }
  };

  remove = async (entry) => {
    const { t } = this.props;
    const { owner, path } = this.state;
    const question = entry.isFolder
      ? t("deleteFolderConfirm", { name: entry.name })
      : t("deleteFileConfirm", { name: entry.name });
    if (!window.confirm(question)) return;
    try {
      await deleteEntry(owner, joinPath(path, entry.name));
      this.refresh();
    } catch (ex) {
      this.setState({ error: this.accessError(ex) || errorMessage(ex, t("errors.generic")) });
    }
  };

  canEdit() {
    return !!(this.state.listing && this.state.listing.canEdit);
  }

  // ---------- render ----------

  renderOwners() {
    const { t, user } = this.props;
    const { owners, owner } = this.state;
    const me = user && user.username;
    return (
      <div className="list-group">
        {owners.length === 0 && (
          <div className="text-muted small p-2">{t("noStaff")}</div>
        )}
        {owners.map((o) => (
          <button
            key={o.username}
            type="button"
            className={
              "list-group-item list-group-item-action d-flex justify-content-between align-items-center" +
              (o.username === owner ? " active" : "")
            }
            onClick={() => this.open(o.username, "")}
          >
            <span className="text-truncate">
              <FolderOutlinedIcon fontSize="small" className="me-2" />
              {o.username}
            </span>
            {o.username === me && (
              <span className="badge bg-success ms-2">{t("mine")}</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  renderBreadcrumb() {
    const { owner, path } = this.state;
    const parts = path ? path.split("/") : [];
    return (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-2">
          <li className={"breadcrumb-item" + (parts.length ? "" : " active")}>
            {parts.length ? (
              <button type="button" className="btn btn-link p-0" onClick={() => this.open(owner, "")}>
                {owner}
              </button>
            ) : (
              owner
            )}
          </li>
          {parts.map((part, i) => {
            const last = i === parts.length - 1;
            const target = parts.slice(0, i + 1).join("/");
            return (
              <li key={target} className={"breadcrumb-item" + (last ? " active" : "")}>
                {last ? (
                  part
                ) : (
                  <button type="button" className="btn btn-link p-0" onClick={() => this.open(owner, target)}>
                    {part}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  renderToolbar() {
    const { t } = this.props;
    const { newFolder } = this.state;
    if (!this.canEdit())
      return <div className="text-muted small mb-2">{t("readOnly")}</div>;

    return (
      <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => this.fileInput.current && this.fileInput.current.click()}
        >
          {t("upload")}
        </button>
        <input
          ref={this.fileInput}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            this.uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
        {newFolder === null ? (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => this.setState({ newFolder: "" })}
          >
            {t("newFolder")}
          </button>
        ) : (
          <form className="d-flex gap-1" onSubmit={this.submitNewFolder}>
            <input
              autoFocus
              className="form-control form-control-sm"
              placeholder={t("folderName")}
              value={newFolder}
              onChange={(e) => this.setState({ newFolder: e.target.value })}
              onKeyDown={(e) => e.key === "Escape" && this.setState({ newFolder: null })}
            />
            <button type="submit" className="btn btn-success btn-sm">
              {t("create")}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => this.setState({ newFolder: null })}
            >
              {t("cancel")}
            </button>
          </form>
        )}
        <span className="text-muted small">{t("dropHint")}</span>
      </div>
    );
  }

  renderUploads() {
    const { t } = this.props;
    const { uploads } = this.state;
    if (!uploads.length) return null;
    return (
      <div className="mb-2">
        {uploads.map((u) => (
          <div key={u.id} className="small mb-1">
            <div className="d-flex justify-content-between">
              <span className="text-truncate">{u.name}</span>
              {u.error ? (
                <button type="button" className="btn btn-link btn-sm p-0" onClick={() => this.dismissUpload(u.id)}>
                  {t("dismiss")}
                </button>
              ) : (
                <span>{u.progress}%</span>
              )}
            </div>
            {u.error ? (
              <div className="text-danger">{u.error}</div>
            ) : (
              <div className="progress" style={{ height: 4 }}>
                <div className="progress-bar" style={{ width: `${u.progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  renderName(entry) {
    const { t } = this.props;
    const { renaming, owner, path } = this.state;
    if (renaming && renaming.name === entry.name)
      return (
        <form className="d-flex gap-1" onSubmit={this.submitRename}>
          <input
            autoFocus
            className="form-control form-control-sm"
            value={renaming.value}
            onChange={(e) => this.setState({ renaming: { ...renaming, value: e.target.value } })}
            onKeyDown={(e) => e.key === "Escape" && this.setState({ renaming: null })}
          />
          <button type="submit" className="btn btn-success btn-sm">
            {t("save")}
          </button>
        </form>
      );

    if (entry.isFolder)
      return (
        <button
          type="button"
          className="btn btn-link p-0 text-start"
          onClick={() => this.open(owner, joinPath(path, entry.name))}
        >
          <FolderIcon fontSize="small" className="me-2" style={{ color: "#e0a800" }} />
          {entry.name}
        </button>
      );

    return previewKind(entry.name) ? (
      <button type="button" className="btn btn-link p-0 text-start" onClick={() => this.preview(entry)}>
        <InsertDriveFileOutlinedIcon fontSize="small" className="me-2" />
        {entry.name}
      </button>
    ) : (
      <span>
        <InsertDriveFileOutlinedIcon fontSize="small" className="me-2" />
        {entry.name}
      </span>
    );
  }

  renderEntries() {
    const { t, i18n } = this.props;
    const { listing } = this.state;
    if (!listing) return null;
    const editable = listing.canEdit;

    if (!listing.entries.length)
      return <div className="text-muted p-4 text-center border rounded">{t("empty")}</div>;

    return (
      <div className="table-responsive">
        <table className="table table-sm table-hover align-middle">
          <thead>
            <tr>
              <th>{t("name")}</th>
              <th className="text-end" style={{ width: 110 }}>{t("size")}</th>
              <th style={{ width: 170 }}>{t("modified")}</th>
              <th className="text-end" style={{ width: 1 }}></th>
            </tr>
          </thead>
          <tbody>
            {listing.entries.map((entry) => (
              <tr key={(entry.isFolder ? "d:" : "f:") + entry.name}>
                <td style={{ wordBreak: "break-all" }}>{this.renderName(entry)}</td>
                <td className="text-end text-nowrap">{entry.isFolder ? "" : formatSize(entry.size)}</td>
                <td className="text-nowrap small">
                  {new Date(entry.modified).toLocaleString(i18n.language)}
                </td>
                <td className="text-end text-nowrap">
                  {!entry.isFolder && previewKind(entry.name) && (
                    <button
                      type="button"
                      className="btn btn-outline-success btn-sm me-1"
                      disabled={this.state.opening === entry.name}
                      onClick={() => this.preview(entry)}
                    >
                      {this.state.opening === entry.name ? t("preview.opening") : t("preview.view")}
                    </button>
                  )}
                  {!entry.isFolder && (
                    <button type="button" className="btn btn-outline-primary btn-sm me-1" onClick={() => this.download(entry)}>
                      {t("download")}
                    </button>
                  )}
                  {editable && (
                    <>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm me-1"
                        onClick={() => this.setState({ renaming: { name: entry.name, value: entry.name } })}
                      >
                        {t("rename")}
                      </button>
                      <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => this.remove(entry)}>
                        {t("delete")}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
    const { t, user } = this.props;
    const { owner, loading, error, dragOver, owners } = this.state;

    if (!user)
      return <div className="alert alert-info">{t("errors.login")}</div>;

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="mb-0">{t("title")}</h3>
          {userHasRole(user, "admin") && (
            <Link to="/documents/staff" className="btn btn-outline-secondary btn-sm">
              {t("staff.title")}
            </Link>
          )}
        </div>

        {error && (
          <div className="alert alert-danger d-flex justify-content-between">
            <span>{error}</span>
            <button type="button" className="btn-close" onClick={() => this.setState({ error: null })} />
          </div>
        )}

        <div className="row">
          <div className="col-md-3 mb-3">{this.renderOwners()}</div>
          <div
            className={"col-md-9" + (dragOver ? " border border-primary border-2 rounded" : "")}
            onDragOver={this.handleDragOver}
            onDragLeave={() => this.setState({ dragOver: false })}
            onDrop={this.handleDrop}
          >
            {owner ? (
              <>
                {this.renderBreadcrumb()}
                {this.renderToolbar()}
                {this.renderUploads()}
                {loading ? (
                  <ReactLoading type="spin" color="blue" height={32} width={32} />
                ) : (
                  this.renderEntries()
                )}
              </>
            ) : (
              owners.length === 0 && !error && <div className="text-muted">{t("noStaff")}</div>
            )}
          </div>
        </div>

        {this.state.viewing && (
          <FilePreview
            name={this.state.viewing.name}
            blob={this.state.viewing.blob}
            onDownload={() => saveBlob(this.state.viewing.blob, this.state.viewing.name)}
            onClose={() => this.setState({ viewing: null })}
          />
        )}
      </div>
    );
  }
}

export default withTranslation("documents")(Documents);
