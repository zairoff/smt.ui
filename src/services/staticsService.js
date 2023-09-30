import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "statics";

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

export function getDefectsByLine(lineId, shift, from, to) {
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

export function getDefectCountByLine(lineId, shift, from, to) {
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

export function getClosedDefectCountByLine(lineId, shift, from, to) {
  const query =
    endPoint +
    "/ClosedDefectCountByLine?lineid=" +
    lineId +
    "&shift=" +
    shift +
    "&from=" +
    from +
    "&to=" +
    to;
  return http.get(query);
}
