import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "lineactivemodel";

export function getActiveModelByLine(lineId) {
  const query = endPoint.concat("?lineId=").concat(lineId);
  return http.get(query);
}

export function setActiveModel(activeModel) {
  return http.put(endPoint, activeModel);
}
