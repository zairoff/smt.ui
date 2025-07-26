import config from "../../config.json";
import http from "../httpService";

const endPoint = config.apiUrl + "qrReader";

function url(id) {
  return `${endPoint}/${id}`;
}

export function getQrReaders() {
  return http.get(endPoint);
}

export function getQrReader(id) {
  return http.get(url(id));
}

export function getQrReaderByName(name) {
  const query = endPoint.concat("/GetByName?name=").concat(name);
  return http.get(query);
}

export function addQrReader(qrReader) {
  return http.post(endPoint, qrReader);
}

export function updateQrReader(id, qrReader) {
  return http.put(url(id), qrReader);
}

export function deleteQrReader(id) {
  return http.delete(url(id));
}
