import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "repairaudit";

// Matches SMT.Domain.RepairAuditType
export const REPAIR_AUDIT_TYPE = {
  AUDIT: 0,
  UTILIZATION: 1,
};

function repairAuditUrl(id) {
  return `${endPoint}/${id}`;
}

export function getRepairAudits() {
  return http.get(endPoint);
}

export function getRepairAudit(id) {
  return http.get(repairAuditUrl(id));
}

export function getRepairAuditsByDateRange(from, to, type, modelId) {
  const query = endPoint.concat(
    `/GetByDateRange?from=${from}&to=${to}&type=${type}${
      modelId ? `&modelId=${modelId}` : ""
    }`
  );
  return http.get(query);
}

export function scanRepairAudit(barcode, employee, type) {
  return http.post(endPoint, { barcode, employee, type });
}

export function deleteRepairAudit(id) {
  return http.delete(repairAuditUrl(id));
}
