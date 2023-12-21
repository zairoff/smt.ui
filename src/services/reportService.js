import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "report";

function reportUrl(id) {
  return `${endPoint}/${id}`;
}

export function getReports() {
  return http.get(endPoint);
}

export function getReport(id) {
  return http.get(reportUrl(id));
}

export function getReportByDate(date, status) {
  const query = endPoint.concat(
    "/GetByDate?date=" + date + "&status=" + status
  );
  return http.get(query);
}

export function getReportByBarcode(barcode) {
  const query = endPoint.concat("/GetByBarcode?barcode=").concat(barcode);
  return http.get(query);
}

export function getReportByModelIdAndLineId(modelId, lineId, shift, date) {
  const query = endPoint.concat(
    "/GetByModelIdAndLineId?modelId=" +
      modelId +
      "&lineId=" +
      lineId +
      "&shift=" +
      shift +
      "&date=" +
      date
  );
  return http.get(query);
}

export function getReportsByLineAndDefect(lineId, defect, shift, from, to) {
  const query = endPoint.concat(
    "/GetByLineAndDefect?lineId=" +
      lineId +
      "&defect=" +
      defect +
      "&shift=" +
      shift +
      "&from=" +
      from +
      "&to=" +
      to
  );
  return http.get(query);
}

export function getReportsBy(modelId, lineId, shift, from, to) {
  const query = endPoint.concat(
    "/GetBy?&modelId=" +
      modelId +
      "&lineId=" +
      lineId +
      "&shift=" +
      shift +
      "&from=" +
      from +
      "&to=" +
      to
  );
  return http.get(query);
}

export function addReport(report) {
  return http.post(endPoint, report);
}

export function updateReport(id, report) {
  return http.put(reportUrl(id), report);
}

export function deleteReport(id) {
  return http.delete(reportUrl(id));
}
