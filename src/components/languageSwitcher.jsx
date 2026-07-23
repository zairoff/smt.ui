import React from "react";
import { useTranslation } from "react-i18next";
import { setStoredLanguage } from "../i18n/languageStorage";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "ru", label: "RU" },
  { code: "uz", label: "UZ" },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    setStoredLanguage(code);
  };

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <li className="nav-item dropdown">
      <button
        type="button"
        className="nav-link dropdown-toggle border-0 bg-transparent"
        id="navbarLanguageDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {current.label}
      </button>
      <ul
        className="dropdown-menu dropdown-menu-end"
        aria-labelledby="navbarLanguageDropdown"
      >
        {LANGUAGES.map((l) => (
          <li key={l.code}>
            <button
              type="button"
              className={`dropdown-item ${
                i18n.language === l.code ? "active" : ""
              }`}
              onClick={() => changeLanguage(l.code)}
            >
              {l.label}
            </button>
          </li>
        ))}
      </ul>
    </li>
  );
};

export default LanguageSwitcher;
