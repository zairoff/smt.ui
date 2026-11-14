import axios from "axios";
import config from "../config.json";
import http from "./httpService";

// Pending (not yet exported) scans for /returned-product-export, stored on the
// server so the scan list can be continued from another device.

const endPoint = config.apiUrl + "ReturnedProductScan";

// Separate instance so background polling doesn't hit the global error toast
// on every tick while the connection is down.
const quietHttp = axios.create();

export function getReturnedProductScans(transactionType) {
  return http.get(endPoint + "?transactionType=" + transactionType);
}

export function pollReturnedProductScans(transactionType) {
  return quietHttp.get(endPoint + "?transactionType=" + transactionType);
}

export function addReturnedProductScan(scan) {
  return http.post(endPoint, scan);
}

export function deleteReturnedProductScan(id) {
  return http.delete(`${endPoint}/${id}`);
}

// Removes the given scans on the server and returns only those actually
// removed, so a scan exported from one device can't be exported again elsewhere.
export function claimReturnedProductScans(transactionType, ids) {
  return http.post(endPoint + "/Claim", { transactionType, ids });
}
