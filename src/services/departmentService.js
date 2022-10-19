import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "department";

function departmentUrl(id) {
  return `${endPoint}/${id}`;
}

export function getDepartments() {
  return http.get(endPoint);
}

export function getDepartment(id) {
  return http.get(departmentUrl(id));
}

export function getDepartmentByHierarchyId(hierarchyId) {
  const query = endPoint.concat("/GetByHierarchyId?hierarchyId=" + hierarchyId);
  return http.get(query);
}

export function addDepartment(department) {
  return http.post(endPoint, department);
}

export function updateDepartment(id, department) {
  return http.put(departmentUrl(id), department);
}

export function deleteDepartment(id) {
  return http.delete(departmentUrl(id));
}
