import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "machineRepair";

function machineRepairUrl(id) {
  return `${endPoint}/${id}`;
}

export function getMachineRepairs() {
  return http.get(endPoint);
}

export function getMachineRepair(id) {
  return http.get(machineRepairUrl(id));
}

export function getMachineRepairByMachineId(machineId) {
  const query = endPoint.concat("/GetByMachine?machineId=").concat(machineId);
  return http.get(query);
}

export function getMachineRepairByMonth(month) {
  const query = endPoint.concat("/GetByMonth?month=").concat(month);
  return http.get(query);
}

export function getMachineRepairByMachineIdAndDate(machineId, month) {
  const query = endPoint
    .concat("/ByMachineIdAndDate?machineId=")
    .concat(machineId)
    .concat("&date=")
    .concat(month);
  return http.get(query);
}

export function addMachineRepair(machineRepair) {
  return http.post(endPoint, machineRepair);
}

export function updateMachineRepair(id, machineRepair) {
  return http.put(machineRepairUrl(id), machineRepair);
}

export function deleteMachineRepair(id) {
  return http.delete(machineRepairUrl(id));
}
