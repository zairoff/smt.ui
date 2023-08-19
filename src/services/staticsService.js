import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "statics";

export function getByProduct(from, to) {
  const query = endPoint + "/ByProduct?from=" + from + "&to=" + to;
  return http.get(query);
}

export function getByBrand(from, to) {
  const query = endPoint + "/ByBrand?from=" + from + "&to=" + to;
  return http.get(query);
}

export function getByModel(from, to) {
  const query = endPoint + "/ByModel?from=" + from + "&to=" + to;
  return http.get(query);
}

export function getByLine(from, to) {
  const query = endPoint + "/ByLine?from=" + from + "&to=" + to;
  return http.get(query);
}

export function getByDefect(from, to) {
  const query = endPoint + "/ByDefect?from=" + from + "&to=" + to;
  return http.get(query);
}

export function DefectsByLine(lineId, shift, from, to) {
  const query =
    endPoint +
    "/DefectsByLine?lineid=" +
    lineId +
    "&shift=" +
    shift +
    "&from=" +
    from +
    "&to=" +
    to;
  return http.get(query);
}

export function DefectCountByLine(lineId, shift, from, to) {
  const query =
    endPoint +
    "/DefectCountByLine?lineid=" +
    lineId +
    "&shift=" +
    shift +
    "&from=" +
    from +
    "&to=" +
    to;
  return http.get(query);
}

export function ClosedDefectCountByLine(lineId, from, to) {
  const query =
    endPoint +
    "/ClosedDefectCountByLine?lineid=" +
    lineId +
    "&from=" +
    from +
    "&to=" +
    to;
  return http.get(query);
}
