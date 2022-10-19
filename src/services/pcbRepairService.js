import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "repair";

function pcbRepairUrl(id) {
  return `${endPoint}/${id}`;
}

export function getPcbRepairs() {
  return http.get(endPoint);
}

export function getPcbRepairsByDate(date) {
  const query = endPoint.concat("/GetByDate?date=").concat(date);
  return http.get(query);
}

export function getRepair(id) {
  return http.get(pcbRepairUrl(id));
}

export function addPcbRepair(repair) {
  return http.post(endPoint, repair);
}

export function deletePcbRepair(id) {
  return http.delete(pcbRepairUrl(id));
}
