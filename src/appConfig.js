import defaults from "./config.json";

// Runtime config: public/runtime-config.js sets window.__SMT_CONFIG__.
// Each deployment folder (D:\www\smt-frontend, D:\www\smt-frontend-domen, ...)
// gets its own runtime-config.js, so one build works for every target.
// Anything not set there falls back to src/config.json (used by `npm start`).
const runtime = (typeof window !== "undefined" && window.__SMT_CONFIG__) || {};

const config = {
  ...defaults,
  apiUrl: runtime.apiUrl || defaults.apiUrl,
  fileUrl: runtime.fileUrl || defaults.fileUrl,
};

export default config;
