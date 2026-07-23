const KEY = "language";

export function getStoredLanguage() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setStoredLanguage(lng) {
  try {
    localStorage.setItem(KEY, lng);
  } catch {
    // ignore write failures (private browsing, storage disabled, etc.)
  }
}
