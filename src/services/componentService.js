import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "component";

export function getComponents() {
  return http.get(endPoint);
}

export function getPagedComponents(page, pageSize) {
  return http.get(endPoint + "/" + page + "/" + pageSize);
}

export function addComponent(component) {
  return http.post(endPoint, component);
}

export function addComponents(components) {
  return http.post(endPoint + "/bulk", components);
}

export function deleteComponent(id) {
  return http.delete(`${endPoint}/${id}`);
}
