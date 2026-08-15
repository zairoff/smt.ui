import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "instructionposition";

function positionUrl(id) {
  return `${endPoint}/${id}`;
}

export function getInstructionPositions() {
  return http.get(endPoint);
}

export function getInstructionPosition(id) {
  return http.get(positionUrl(id));
}

export function getInstructionPositionsByLine(lineId) {
  const query = endPoint.concat("/GetByLine?lineId=").concat(lineId);
  return http.get(query);
}

export function addInstructionPosition(position) {
  return http.post(endPoint, position);
}

export function updateInstructionPosition(id, position) {
  return http.put(positionUrl(id), position);
}

export function deleteInstructionPosition(id) {
  return http.delete(positionUrl(id));
}
