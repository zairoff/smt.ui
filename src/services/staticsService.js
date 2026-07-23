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

export function DefectsByLine(lineId, from, to) {
  const query =
    endPoint +
    "/DefectsByLine?lineid=" +
    lineId +
    "&from=" +
    from +
    "&to=" +
    to;
  return http.get(query);
}

export function DefectCountByLine(lineId, from, to) {
  const query =
    endPoint +
    "/DefectCountByLine?lineid=" +
    lineId +
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

// Expected response: [{ date: "yyyy-MM-dd", planned: number, produced: number }, ...]
export function getPlanStatics(from, to, lineId) {
  let query = endPoint + "/Plan?from=" + from + "&to=" + to;
  if (lineId) query += "&lineId=" + lineId;
  return http.get(query);
}

// Expected response: [{ date: "yyyy-MM-dd", ftq: number }, ...] (ftq is a 0-100 percentage)
export function getQualityStatics(from, to, lineId) {
  let query = endPoint + "/Quality?from=" + from + "&to=" + to;
  if (lineId) query += "&lineId=" + lineId;
  return http.get(query);
}

// Expected response: [{ lineId, lineName, modelId, modelName, planned, produced }, ...]
export function getPlanDetailsByDate(date, lineId) {
  let query = endPoint + "/PlanDetails?date=" + date;
  if (lineId) query += "&lineId=" + lineId;
  return http.get(query);
}

// Expected response: [{ lineId, lineName, modelId, modelName, produced, defectCount, ftq }, ...]
export function getQualityDetailsByDate(date, lineId) {
  let query = endPoint + "/QualityDetails?date=" + date;
  if (lineId) query += "&lineId=" + lineId;
  return http.get(query);
}
