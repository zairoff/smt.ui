import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "componentrequest";
const itemEndPoint = config.apiUrl + "componentrequestitem";

export function getAllComponentRequests() {
  return http.get(endPoint);
}

export function getOpenComponentRequests() {
  return http.get(endPoint + "/open");
}

export function createComponentRequest(componentRequest) {
  return http.post(endPoint, componentRequest);
}

export function markItemNotFound(id) {
  return http.put(`${itemEndPoint}/${id}/not-found`);
}

export function transferItems(ids) {
  return http.post(itemEndPoint + "/transfer", { ids });
}
