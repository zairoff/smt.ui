import config from "../../appConfig";
import http from "../httpService";

const endPoint = config.apiUrl + "feedersetup";

export function getFeederSetups({ lineId, modelId, status } = {}) {
  return http.get(endPoint, { params: { lineId, modelId, status } });
}

export function getFeederSetup(id) {
  return http.get(`${endPoint}/${id}`);
}

export function getFeederSetupDiff(id, againstId) {
  return http.get(`${endPoint}/${id}/diff`, { params: { againstId } });
}

// import: { lineId, modelId, side, sourceFileName, rows: [{ rowNumber, module, feeder, code }] }
export function previewFeederSetup(importData) {
  return http.post(`${endPoint}/preview`, importData);
}

export function importFeederSetup(importData) {
  return http.post(`${endPoint}/import`, importData);
}

export function activateFeederSetup(id) {
  return http.put(`${endPoint}/${id}/activate`);
}

export function copyFeederSetup(id, targetLineId) {
  return http.post(`${endPoint}/${id}/copy`, { targetLineId });
}

export function deleteFeederSetup(id) {
  return http.delete(`${endPoint}/${id}`);
}
