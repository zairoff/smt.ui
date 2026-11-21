import config from "../../appConfig";
import http from "../httpService";

const endPoint = config.apiUrl + "feederstation";

export function getFeederStation(lineId) {
  return http.get(`${endPoint}/${lineId}`);
}

// scan: { lineId, setupId, reelCode }
export function lookupReel(scan) {
  return http.post(`${endPoint}/lookup`, scan);
}

// scan: { lineId, setupId, reelCode, slotCode }
export function verifyReel(scan) {
  return http.post(`${endPoint}/verify`, scan);
}
