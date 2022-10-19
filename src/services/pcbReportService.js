import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "pcbreport";

function pcbReport(id) {
  return `${endPoint}/${id}`;
}

export function getPcbReports() {
  return http.get(endPoint);
}

export function getPcbReportsByModelLineAndDate(model, line, date) {
  const query = endPoint.concat(
    "/ByModelLineAndDate?modelId=" + model + "&lineId=" + line + "&date=" + date
  );
  return http.get(query);
}

export function addPcbReport(report) {
  console.log(report);
  return http.post(endPoint, report);
}
