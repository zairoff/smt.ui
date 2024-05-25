import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "printer";

export function print(print) {
  return http.post(endPoint, print);
}
