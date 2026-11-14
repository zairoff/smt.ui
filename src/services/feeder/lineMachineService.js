import config from "../../config.json";
import http from "../httpService";

const endPoint = config.apiUrl + "linemachine";

export function getLineMachines() {
  return http.get(endPoint);
}

// Resolves with data === null (HTTP 204) when the line has no machine yet.
export function getLineMachine(lineId) {
  return http.get(`${endPoint}/line/${lineId}`);
}

export function saveLineMachine(machine) {
  return http.put(endPoint, machine);
}

export function addModule(lineId, module) {
  return http.post(`${endPoint}/line/${lineId}/module`, module);
}

export function updateModule(moduleId, module) {
  return http.put(`${endPoint}/module/${moduleId}`, module);
}

export function addSlots(moduleId, range) {
  return http.post(`${endPoint}/module/${moduleId}/slots`, range);
}

export function setSlotActive(slotId, isActive) {
  return http.put(`${endPoint}/slot/${slotId}/active`, null, {
    params: { isActive },
  });
}
