import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "repairaudit";

function repairAuditUrl(id) {
  return `${endPoint}/${id}`;
}

export function getRepairAudits() {
  return http.get(endPoint);
}

export function getRepairAudit(id) {
  return http.get(repairAuditUrl(id));
}

export function getRepairAuditsByDateRange(from, to, modelId) {
  const query = endPoint.concat(
    `/GetByDateRange?from=${from}&to=${to}${modelId ? `&modelId=${modelId}` : ""}`
  );
  return http.get(query);
}

export function scanRepairAudit(barcode, employee) {
  return http.post(endPoint, { barcode, employee });
}

export function deleteRepairAudit(id) {
  return http.delete(repairAuditUrl(id));
}
