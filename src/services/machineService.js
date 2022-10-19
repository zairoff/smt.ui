import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "machine";

function machineUrl(id) {
  return `${endPoint}/${id}`;
}

export function getMachines() {
  return http.get(endPoint);
}

export function getMachine(id) {
  return http.get(machineUrl(id));
}

export function getMachineByName(name) {
  const query = endPoint.concat("/GetByName?name=").concat(name);
  return http.get(query);
}

export function addMachine(machine) {
  return http.post(endPoint, machine);
}

export function deleteMachine(id) {
  return http.delete(machineUrl(id));
}
