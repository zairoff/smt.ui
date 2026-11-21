import config from "../appConfig";
import http from "./httpService";

const endPoint = config.apiUrl + "assistant";

// history: [{ role: "user" | "assistant", text }], oldest first.
// Response: { answer, columns: [string], rows: [[string]], sources: [string] }
export function ask(question, language, history) {
  return http.post(endPoint + "/Ask", { question, language, history });
}
