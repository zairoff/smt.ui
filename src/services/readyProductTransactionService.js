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
const endPoint = config.apiUrl + "ReadyProductTransaction";

function readyProductUrl(id) {
  return `${endPoint}/${id}`;
}

export function getReadyProductTransactions() {
  return http.get(endPoint);
}

export function getReadyProductTransaction(id) {
  return http.get(readyProductUrl(id));
}

export function getTransactionByDateGroupByModel(date, transactionType) {
  const query = endPoint.concat(
    "/GetByDateGroupBy?dateTime=" + date + "&transactionType=" + transactionType
  );
  return http.get(query);
}

export function getTransactionByDateRangeGroupByModel(
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

export function getTransactionByDate(date, transactionType) {
  const query = endPoint.concat(
    "/GetByDate?dateTime=" + date + "&transactionType=" + transactionType
  );
  return http.get(query);
}

export function getTransactionByProductBrand(productBrandId) {
  const query = endPoint.concat(
    "/GetByProductBrand?productBrandId=" + productBrandId
  );
  return http.get(query);
}

export function getTransactionByProduct(productId) {
  const query = endPoint.concat("/GetByProduct?productId=" + productId);
  return http.get(query);
}

export function getTransactionByDateRange(from, to, transactionType) {
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

export function getTransactionBySapCodeDateRange(
  sapCode,
  from,
  to,
  transactionType
) {
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

export function importReadyProductTransaction(readyProduct) {
  return http.post(endPoint, readyProduct);
}

export function exportReadyProductTransaction(readyProduct) {
  return http.put(endPoint, readyProduct);
}

export function deleteReadyProductTransaction(id) {
  return http.delete(readyProductUrl(id));
}
