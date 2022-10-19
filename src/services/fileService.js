import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "file";

function fileUrl(id) {
  return `${endPoint}/${id}`;
}

export function getFiles() {
  return http.get(endPoint);
}

export function getFile(filename) {
  return http.get(fileUrl(filename));
}

export function addFile(file) {
  return http.post(endPoint, file);
}

export function updateFile(fileName) {
  return http.put(endPoint, fileName);
}

export function deleteFile(fileName) {
  return http.delete(fileUrl(fileName));
}
