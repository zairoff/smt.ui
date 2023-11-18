import config from "../config.json";
import http from "./httpService";

/**
 *  public enum TransactionType
    {
        All = 0,
        Import = 1,
        Export = 2,
        Deleted = 3,
    }
 */
const endPoint = config.apiUrl + "readyproduct";

function readyProductUrl(id) {
  return `${endPoint}/${id}`;
}

export function getReadyProducts() {
  return http.get(endPoint);
}

export function getReadyProduct(id) {
  return http.get(readyProductUrl(id));
}

export function getReadyProductByDateGroupByModel(date, transactionType) {
  const query = endPoint.concat(
    "/GetByDateGroupBy?dateTime=" + date + "&transactionType=" + transactionType
  );
  return http.get(query);
}

export function getReadyProductByDateRangeGroupByModel(
  from,
  to,
  transactionType
) {
  const query = endPoint.concat(
    "/GetByDateRangeGroupBy?from=" +
      from +
      "&to=" +
      to +
      "&transactionType=" +
      transactionType
  );
  return http.get(query);
}

export function getReadyProductByDate(date, transactionType) {
  const query = endPoint.concat(
    "/GetByDate?dateTime=" + date + "&transactionType=" + transactionType
  );
  return http.get(query);
}

export function getReadyProductByProductBrand(productBrandId) {
  const query = endPoint.concat(
    "/GetByProductBrand?productBrandId=" + productBrandId
  );
  return http.get(query);
}

export function getReadyProductByProduct(productId) {
  const query = endPoint.concat("/GetByProduct?productId=" + productId);
  return http.get(query);
}

export function getReadyProductByDateRange(from, to, transactionType) {
  const query = endPoint.concat(
    "/GetByEnterDateRange?from=" +
      from +
      "&to=" +
      to +
      "&transactionType=" +
      transactionType
  );
  return http.get(query);
}

export function getBySapCodeDateRange(sapCode, from, to, transactionType) {
  const query = endPoint.concat(
    "/GetBySapCodeDateRange?sapCode=" +
      sapCode +
      "&from=" +
      from +
      "&to=" +
      to +
      "&transactionType=" +
      transactionType
  );
  return http.get(query);
}

export function importReadyProduct(readyProduct) {
  return http.post(endPoint, readyProduct);
}

export function exportReadyProduct(readyProduct) {
  return http.put(endPoint, readyProduct);
}

export function deleteReadyProductTransaction(id) {
  return http.delete(readyProductUrl(id));
}
