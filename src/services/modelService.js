import config from "../appConfig";
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

export function getModelBySapCode(sapCode) {
  const query = endPoint.concat("/GetBySapCode?sapCode=").concat(sapCode);
  return http.get(query);
}

export function getModelByBarcode(barcode) {
  const query = endPoint.concat("/GetByBarcode?barcode=").concat(barcode);
  return http.get(query);
}

// isActive defaults to true on the backend, so callers that only want
// selectable (produced) models can omit it.
export function getModelByProductBrandId(id, isActive) {
  const query = endPoint
    .concat("/GetByProductBrandId?productBrandId=")
    .concat(id);
  return http.get(query, { params: { isActive } });
}

export function setModelStatus(id, isActive) {
  return http.put(`${modelUrl(id)}/status`, null, { params: { isActive } });
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
