import config from "../../config.json";
import http from "../httpService";

const endPoint = config.apiUrl + "BoardReport";

function url(id) {
  return `${endPoint}/${id}`;
}

export function getBoardReport(id) {
  return http.get(url(id));
}

export function getBoardReportByReaderAndDate(readerId, date) {
  const query = endPoint.concat(
    "/GetByReader?readerId=" + readerId + "&from=" + date + "&to=" + date
  );
  return http.get(query);
}

export function addBoardReport(boardReport) {
  return http.post(endPoint, boardReport);
}

export function deleteBoardReport(id) {
  return http.delete(url(id));
}
