import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "machineRepairer";

function machineRepairerUrl(id) {
  return `${endPoint}/${id}`;
}

export function getMachineRepairers() {
  return http.get(endPoint);
}

export function getMachineRepairer(id) {
  return http.get(machineRepairerUrl(id));
}

export function addMachineRepairer(machineRepair) {
  return http.post(endPoint, machineRepair);
}

export function deleteMachineRepairer(id) {
  return http.delete(machineRepairerUrl(id));
}
