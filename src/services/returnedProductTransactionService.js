import config from "../config.json";
import http from "./httpService";

/**
    public enum ReturnedProductTransactionType
    {
        All = 0,
        Import = 1,
        ImportFromRepair = 2,
        ImportUtilize = 3,
        Export = 4,
        ExportToRepair = 5,
        ExportUtilize = 6,
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
    "/GetByEnterDateRange?from=" +
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

export function deleteReturnedProductTransaction(id) {
  return http.delete(returnedProductUrl(id));
}
