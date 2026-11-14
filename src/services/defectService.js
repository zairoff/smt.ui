import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "defect";

function defectUrl(id) {
  return `${endPoint}/${id}`;
}

// isActive defaults to true on the backend, so callers that only want
// selectable defects can omit it.
export function getDefects(isActive) {
  return http.get(endPoint, { params: { isActive } });
}

export function setDefectStatus(id, isActive) {
  return http.put(`${defectUrl(id)}/status`, null, { params: { isActive } });
}

export function getDefect(id) {
  return http.get(defectUrl(id));
}

export function getDefectByName(name) {
  const query = endPoint.concat("/GetByName?name=").concat(name);
  return http.get(query);
}

export function addDefect(defect) {
  return http.post(endPoint, defect);
}

export function updateDefect(id, defect) {
  return http.put(defectUrl(id), defect);
}

export function deleteDefect(id) {
  return http.delete(defectUrl(id));
}
