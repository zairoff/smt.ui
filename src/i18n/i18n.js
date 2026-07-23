import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enCommon from "./locales/en/common.json";
import enNavbar from "./locales/en/navbar.json";
import enForms from "./locales/en/forms.json";
import enTables from "./locales/en/tables.json";
import enReports from "./locales/en/reports.json";
import enStatics from "./locales/en/statics.json";
import enStore from "./locales/en/store.json";
import enBoardFlow from "./locales/en/boardFlow.json";
import enReadyProduct from "./locales/en/readyProduct.json";
import enReturnProduct from "./locales/en/returnProduct.json";
import enMachines from "./locales/en/machines.json";

import ruCommon from "./locales/ru/common.json";
import ruNavbar from "./locales/ru/navbar.json";
import ruForms from "./locales/ru/forms.json";
import ruTables from "./locales/ru/tables.json";
import ruReports from "./locales/ru/reports.json";
import ruStatics from "./locales/ru/statics.json";
import ruStore from "./locales/ru/store.json";
import ruBoardFlow from "./locales/ru/boardFlow.json";
import ruReadyProduct from "./locales/ru/readyProduct.json";
import ruReturnProduct from "./locales/ru/returnProduct.json";
import ruMachines from "./locales/ru/machines.json";

import uzCommon from "./locales/uz/common.json";
import uzNavbar from "./locales/uz/navbar.json";
import uzForms from "./locales/uz/forms.json";
import uzTables from "./locales/uz/tables.json";
import uzReports from "./locales/uz/reports.json";
import uzStatics from "./locales/uz/statics.json";
import uzStore from "./locales/uz/store.json";
import uzBoardFlow from "./locales/uz/boardFlow.json";
import uzReadyProduct from "./locales/uz/readyProduct.json";
import uzReturnProduct from "./locales/uz/returnProduct.json";
import uzMachines from "./locales/uz/machines.json";

import { getStoredLanguage } from "./languageStorage";

export const SUPPORTED_LANGUAGES = ["en", "ru", "uz"];

const resources = {
  en: {
    common: enCommon,
    navbar: enNavbar,
    forms: enForms,
    tables: enTables,
    reports: enReports,
    statics: enStatics,
    store: enStore,
    boardFlow: enBoardFlow,
    readyProduct: enReadyProduct,
    returnProduct: enReturnProduct,
    machines: enMachines,
  },
  ru: {
    common: ruCommon,
    navbar: ruNavbar,
    forms: ruForms,
    tables: ruTables,
    reports: ruReports,
    statics: ruStatics,
    store: ruStore,
    boardFlow: ruBoardFlow,
    readyProduct: ruReadyProduct,
    returnProduct: ruReturnProduct,
    machines: ruMachines,
  },
  uz: {
    common: uzCommon,
    navbar: uzNavbar,
    forms: uzForms,
    tables: uzTables,
    reports: uzReports,
    statics: uzStatics,
    store: uzStore,
    boardFlow: uzBoardFlow,
    readyProduct: uzReadyProduct,
    returnProduct: uzReturnProduct,
    machines: uzMachines,
  },
};

function detectInitialLanguage() {
  const stored = getStoredLanguage();
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;

  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED_LANGUAGES.includes(browser) ? browser : "en";
}

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: "en",
  ns: [
    "common",
    "navbar",
    "forms",
    "tables",
    "reports",
    "statics",
    "store",
    "boardFlow",
    "readyProduct",
    "returnProduct",
    "machines",
  ],
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
