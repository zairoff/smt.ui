import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "document";

// Staff document folders. `owner` is the folder owner's username, `path` is a
// "/"-separated folder path inside their folder ("" = top level).

// [{ username, isAdmin }]
export function getOwners() {
  return http.get(endPoint + "/owners");
}

// { owner, path, canEdit, entries: [{ name, isFolder, size, modified }] }
export function listFolder(owner, path) {
  return http.get(endPoint + "/list", { params: { owner, path } });
}

// Resolves to a Blob. The server always sends application/octet-stream.
export function downloadFile(owner, path) {
  return http.get(endPoint + "/download", {
    params: { owner, path },
    responseType: "blob",
  });
}

export function uploadFile(owner, path, file, overwrite, onProgress) {
  const form = new FormData();
  form.append("file", file);
  return http.post(endPoint + "/upload", form, {
    params: { owner, path, overwrite },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
}

export function createFolder(owner, path, name) {
  return http.post(endPoint + "/folder", { owner, path, name });
}

export function renameEntry(owner, path, newName) {
  return http.post(endPoint + "/rename", { owner, path, newName });
}

export function deleteEntry(owner, path) {
  return http.delete(endPoint, { params: { owner, path } });
}

// ---- staff accounts (admin only) ----

export function getStaff() {
  return http.get(endPoint + "/staff");
}

// Response: { username, isAdmin, existingAccount }
export function createStaff({ username, password, isAdmin }) {
  return http.post(endPoint + "/staff", { username, password, isAdmin });
}

export function resetStaffPassword(username, password) {
  return http.put(endPoint + "/staff/password", { password }, { params: { username } });
}

export function deleteStaff(username) {
  return http.delete(endPoint + "/staff", { params: { username } });
}
