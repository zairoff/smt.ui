import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "component";

function componentUrl(id) {
  return `${endPoint}/${id}`;
}

export function getComponents() {
  return http.get(endPoint);
}

export function addComponent(component) {
  return http.post(endPoint, component);
}

export function addComponents(components) {
  return http.post(endPoint + "/bulk", components);
}
