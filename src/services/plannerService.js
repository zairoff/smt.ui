import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "lineOwner";

function plannerUrl(id) {
    return `${endPoint}/${id}`;
}

export function getPlanners() {
    return http.get(endPoint);
}

export function getPlanner(id) {
    return http.get(plannerUrl(id));
}

export function getPlannersByLine(lineId) {
    const query = endPoint.concat("/ByLine?lineId=").concat(lineId);
    return http.get(query);
}

export function AddPlanner(planner) {
    return http.post(endPoint, planner);
}

export function deletePlanner(id) {
    return http.delete(plannerUrl(id));
}
