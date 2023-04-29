import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "planActivity";

function planActivityUrl(id) {
  return `${endPoint}/${id}`;
}

export function getPlanActivities() {
  return http.get(endPoint);
}

export function getPlanActivity(id) {
  return http.get(planActivityUrl(id));
}

export function getPlanActivityByLine(lineId) {
  const query = endPoint.concat("/GetByLine?lineId=").concat(lineId);
  return http.get(query);
}

export function getPlanActivityByDate(date) {
  const query = endPoint.concat("/GetByDate?date=").concat(date);
  return http.get(query);
}

export function getPlanActivityByLineAndDate(lineId, from, to) {
  const query = endPoint.concat(
    "/GetByLineAndDate?lineId=" + lineId + "&from=" + from + "&to=" + to
  );
  return http.get(query);
}

export function addPlanActivity(planActivity) {
  return http.post(endPoint, planActivity);
}

export function updatePlanActivity(id, planActivity) {
  return http.put(planActivityUrl(id), planActivity);
}

export function deletePlanActivity(id) {
  return http.delete(planActivityUrl(id));
}
