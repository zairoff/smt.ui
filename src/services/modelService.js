import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "model";

function modelUrl(id) {
  return `${endPoint}/${id}`;
}

export function getModels() {
  return http.get(endPoint);
}

export function getModel(id) {
  return http.get(modelUrl(id));
}

export function getModelByName(name) {
  const query = endPoint.concat("/GetByName?name=").concat(name);
  return http.get(query);
}

export function getModelByProductBrandId(id) {
  const query = endPoint
    .concat("/GetByProductBrandId?productBrandId=")
    .concat(id);
  return http.get(query);
}

export function addModel(model) {
  return http.post(endPoint, model);
}

export function updateModel(id, model) {
  return http.put(modelUrl(id), model);
}

export function deleteModel(id) {
  return http.delete(modelUrl(id));
}
