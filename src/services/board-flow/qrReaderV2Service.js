import config from "../../config.json";
import http from "../httpService";

const endPoint = config.apiUrl + "qrReaderV2";

function url(id) {
  return `${endPoint}/${id}`;
}

// Expected response: [{ id, lineId, line: {id, name}, name, position, isActive, previousReaders: [{id, name, lineId, lineName}, ...] }, ...]
// previousReaders can have more than one entry for a convergence station (e.g. a
// PCB line's entry station fed by both the Parmi and Jutze SMD lines).
export function getQrReadersV2(lineId, isActive) {
  let query = endPoint;
  const params = [];
  if (lineId !== undefined && lineId !== null && lineId !== "")
    params.push("lineId=" + lineId);
  if (isActive !== undefined && isActive !== null)
    params.push("isActive=" + isActive);
  if (params.length) query += "?" + params.join("&");
  return http.get(query);
}

export function getQrReaderV2(id) {
  return http.get(url(id));
}

export function addQrReaderV2(qrReader) {
  return http.post(endPoint, qrReader);
}

export function updateQrReaderV2(id, qrReader) {
  return http.put(url(id), qrReader);
}

export function deleteQrReaderV2(id) {
  return http.delete(url(id));
}
