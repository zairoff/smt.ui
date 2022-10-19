import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "line";

function lineUrl(id) {
  return `${endPoint}/${id}`;
}

export function getLines() {
  return http.get(endPoint);
}

export function getLine(id) {
  return http.get(lineUrl(id));
}

export function getLineByName(name) {
  const query = endPoint.concat("/GetByName?name=").concat(name);
  return http.get(query);
}

export function addLine(line) {
  return http.post(endPoint, line);
}

export function updateLine(id, line) {
  return http.put(lineUrl(id), line);
}

export function deleteLine(id) {
  return http.delete(lineUrl(id));
}
