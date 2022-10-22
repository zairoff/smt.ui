import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "plan";

function planUrl(id) {
  return `${endPoint}/${id}`;
}

export function getPlans() {
  return http.get(endPoint);
}

export function getPlan(id) {
  return http.get(planUrl(id));
}

export function getPlanByProduct(productId) {
  const query = endPoint.concat("/GetByProduct?productId=").concat(productId);
  return http.get(query);
}

export function getPlanByBrand(brandId) {
  const query = endPoint.concat("/GetByBrand?brandId=").concat(brandId);
  return http.get(query);
}

export function getPlanByModel(modelId) {
  const query = endPoint.concat("/GetByModel?modelId=").concat(modelId);
  return http.get(query);
}

export function getPlanByLine(lineId) {
  const query = endPoint.concat("/GetByLine?lineId=").concat(lineId);
  return http.get(query);
}

export function getPlanByDate(date) {
  const query = endPoint.concat("/GetByDate?date=").concat(date);
  return http.get(query);
}

export function getPlanByLineAndDate(lineId, from, to) {
  const query = endPoint.concat(
    "/GetByLineAndDate?lineId=" + lineId + "&from=" + from + "&to=" + to
  );
  return http.get(query);
}

export function addPlan(plan) {
  return http.post(endPoint, plan);
}

export function updatePlan(id, plan) {
  return http.put(planUrl(id), plan);
}

export function deletePlan(id) {
  return http.delete(planUrl(id));
}
