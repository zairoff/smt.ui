import config from "../config.json";
import http from "./httpService";

const endPoint = config.apiUrl + "productBrand";

function productBrandUrl(id) {
  return `${endPoint}/${id}`;
}

export function getProductBrands() {
  return http.get(endPoint);
}

export function getProductBrand(id) {
  return http.get(productBrandUrl(id));
}

export function getProductBrandByProductId(id) {
  const query = endPoint.concat("/GetByProductId?productId=").concat(id);
  return http.get(query);
}

export function getProductBrandByProductAndBrandId(productId, brandId) {
  const query = endPoint
    .concat("/GetByProductAndBrandId?productId=")
    .concat(productId)
    .concat("&brandId=")
    .concat(brandId);
  return http.get(query);
}

export function addProductBrand(brand) {
  return http.post(endPoint, brand);
}

export function updateProductBrand(id, brand) {
  return http.put(productBrandUrl(id), brand);
}

export function deleteProductBrand(id) {
  return http.delete(productBrandUrl(id));
}
