import config from "../config.json";
import http from "./httpService";

/**
    public enum ReturnedProductTransactionType
    {
        All = 0,
        ImportFromFactoryToBuffer = 1,
        ExportFromRepairToStore = 2,
        ExportFromRepairToUtilize = 3,
        ExportFromStoreToFactory = 4,
        ExportFromBufferToRepair = 5,
        ExportFromStoreToUtilize = 6,
        Deleted = 7,
    }
 */

const endPoint = config.apiUrl + "ReturnedProductTransaction";

function returnedProductUrl(id) {
  return `${endPoint}/${id}`;
}

export function getReturnedProductTransaction(id) {
  return http.get(returnedProductUrl(id));
}

export function getReturnedProductByDateGroupByModel(date, transactionType) {
  const query = endPoint.concat(
    "/GetByDateGroupBy?dateTime=" + date + "&transactionType=" + transactionType
  );
  return http.get(query);
}

export function getReturnedProductByDateRangeGroupByModel(
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

export function getReturnedProductByDate(date, transactionType) {
  const query = endPoint.concat(
    "/GetByDate?dateTime=" + date + "&transactionType=" + transactionType
  );
  return http.get(query);
}

export function getReturnedProductByDateRange(from, to, transactionType) {
  const query = endPoint.concat(
    "/GetByDateRange?from=" +
      from +
      "&to=" +
      to +
      "&transactionType=" +
      transactionType
  );
  return http.get(query);
}

export function importReturnedProduct(returnedProduct) {
  return http.post(endPoint + "/import", returnedProduct);
}

export function exportReturnedProduct(returnedProduct) {
  return http.post(endPoint + "/export", returnedProduct);
}

export function getStoreState() {
  const query = endPoint.concat("/GetStoreState");
  return http.get(query);
}

export function getRepairState() {
  const query = endPoint.concat("/GetRepairState");
  return http.get(query);
}

export function getUtilizeState() {
  const query = endPoint.concat("/GetUtilizeState");
  return http.get(query);
}

export function getBufferState() {
  const query = endPoint.concat("/GetBufferState");
  return http.get(query);
}

export function deleteReturnedProductTransaction(id) {
  return http.delete(returnedProductUrl(id));
}
