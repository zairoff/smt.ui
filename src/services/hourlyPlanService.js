import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "HourlyPlan";

function planUrl(id) {
  return `${endPoint}/${id}`;
}

export function getPlans() {
  return http.get(endPoint);
}

export function getPlan(id) {
  return http.get(planUrl(id));
}

export function getHourlyPlanByProduct(productId) {
  const query = endPoint.concat("/GetByProduct?productId=").concat(productId);
  return http.get(query);
}

export function getHourlyPlanByBrand(brandId) {
  const query = endPoint.concat("/GetByBrand?brandId=").concat(brandId);
  return http.get(query);
}

export function getHourlyPlanByModel(modelId) {
  const query = endPoint.concat("/GetByModel?modelId=").concat(modelId);
  return http.get(query);
}

export function getHourlyPlanByLine(lineId) {
  const query = endPoint.concat("/GetByLine?lineId=").concat(lineId);
  return http.get(query);
}

export function getHourlyPlanByDate(date) {
  const query = endPoint.concat("/GetByDate?date=").concat(date);
  return http.get(query);
}

export function getHourlyPlanByLineAndDate(lineId, from, to) {
  const query = endPoint.concat(
    "/GetByLineAndDate?lineId=" + lineId + "&from=" + from + "&to=" + to
  );
  return http.get(query);
}

export function hourlyPlanNotify() {
  const query = endPoint.concat("/Notify");
  return http.post(query);
}

export function addHourlyPlan(plan) {
  return http.post(endPoint, plan);
}

export function updateHourlyPlan(id, plan) {
  return http.put(planUrl(id), plan);
}

export function deleteHourlyPlan(id) {
  return http.delete(planUrl(id));
}
