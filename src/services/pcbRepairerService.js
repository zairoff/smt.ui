import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "pcbrepairer";

function pcbRepairerUrl(id) {
  return `${endPoint}/${id}`;
}

export function getPcbRepairers() {
  return http.get(endPoint);
}

export function getPcbRepairer(id) {
  return http.get(pcbRepairerUrl(id));
}

export function addPcbRepairer(repairer) {
  return http.post(endPoint, repairer);
}

export function deletePcbRepairer(id) {
  return http.delete(pcbRepairerUrl(id));
}
