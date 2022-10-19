import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "lineDefect";

function lineDefectUrl(id) {
  return `${endPoint}/${id}`;
}

export function getLineDefects() {
  return http.get(endPoint);
}

export function getLineDefect(id) {
  return http.get(lineDefectUrl(id));
}

export function getLineDefectByLineId(id) {
  const query = endPoint.concat("/GetByLineId?lineId=").concat(id);
  return http.get(query);
}

export function getByLineAndDefectId(lineId, defectId) {
  const query = endPoint
    .concat("/GetByLineAndDefectId?lineId=")
    .concat(lineId)
    .concat("&defectId=")
    .concat(defectId);
  return http.get(query);
}

export function addLineDefect(lineDefect) {
  return http.post(endPoint, lineDefect);
}

export function updateLineDefect(id, lineDefect) {
  return http.put(lineDefectUrl(id), lineDefect);
}

export function deleteLineDefect(id) {
  return http.delete(lineDefectUrl(id));
}
