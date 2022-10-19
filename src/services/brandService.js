import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "brand";

function brandUrl(id) {
  return `${endPoint}/${id}`;
}

export function getBrands() {
  return http.get(endPoint);
}

export function getBrand(id) {
  return http.get(brandUrl(id));
}

export function getBrandByName(name) {
  const query = endPoint.concat("/GetByName?name=").concat(name);
  return http.get(query);
}

export function addBrand(brand) {
  return http.post(endPoint, brand);
}

export function updateBrand(id, brand) {
  return http.put(brandUrl(id), brand);
}

export function deleteBrand(id) {
  return http.delete(brandUrl(id));
}
