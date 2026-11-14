import axios from "axios";
import { toast } from "react-toastify";
import i18n from "../i18n/i18n";

// Most endpoints are anonymous, but newer ones (feeder verification) require a
// logged-in user so actions are attributable - send the token whenever there is one.
axios.interceptors.request.use((request) => {
  const token = localStorage.getItem("token");
  if (token && !request.headers.Authorization) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

axios.interceptors.response.use(null, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;

  if (!expectedError) {
    toast.error(i18n.t("common:errors.unexpected"));
  }

  return Promise.reject(error);
});

const http = {
  get: axios.get,
  post: axios.post,
  put: axios.put,
  delete: axios.delete,
  patch: axios.patch,
};

export default http;
