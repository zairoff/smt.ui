import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "employee";

function employeeUrl(id) {
  return `${endPoint}/${id}`;
}

export function getEmployees() {
  return http.get(endPoint);
}

export function getEmployee(id) {
  return http.get(employeeUrl(id));
}

export function getEmployeeByDepartmentId(departmentId, isActive) {
  const query = endPoint
    .concat("/GetByDeparment?departmentId=")
    .concat(departmentId)
    .concat("&isActive=")
    .concat(isActive);
  return http.get(query);
}

export function addEmployee(employee) {
  return http.post(endPoint, employee);
}

export function updateEmployee(id, employee) {
  return http.put(employeeUrl(id), employee);
}

export function patchEmployee(id, isActive) {
  const query = endPoint + "/" + id + "?isActive=" + isActive;
  return http.patch(query);
}

export function deleteEmployee(id) {
  return http.delete(employeeUrl(id));
}
