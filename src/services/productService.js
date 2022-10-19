import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "product";

function productUrl(id) {
  return `${endPoint}/${id}`;
}

export function getProducts() {
  return http.get(endPoint);
}

export function getProduct(id) {
  return http.get(productUrl(id));
}

export function getProductByName(name) {
  const query = endPoint.concat("/GetByName?name=").concat(name);
  return http.get(query);
}

export function addProduct(product) {
  return http.post(endPoint, product);
}

export function updateProduct(id, product) {
  return http.put(productUrl(id), product);
}

export function deleteProduct(id) {
  return http.delete(productUrl(id));
}
