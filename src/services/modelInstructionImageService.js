import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "modelinstructionimage";

export function getInstructionImagesByModel(modelId) {
  const query = endPoint.concat("/GetByModel?modelId=").concat(modelId);
  return http.get(query);
}

export function getInstructionImagesByPosition(positionId) {
  const query = endPoint.concat("/GetByPosition?positionId=").concat(positionId);
  return http.get(query);
}

export function getCurrentInstructionByPosition(positionId) {
  const query = endPoint.concat("/GetCurrentByPosition?positionId=").concat(positionId);
  return http.get(query);
}

export function addOrUpdateInstructionImage(instructionImage) {
  return http.post(endPoint, instructionImage);
}

export function deleteInstructionImage(id) {
  return http.delete(`${endPoint}/${id}`);
}
