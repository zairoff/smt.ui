import jwtDecode from "jwt-decode";

// The stored JWT, or null when there is none or it has expired. An expired token is
// removed so the app stops showing the user as logged in.
export function getValidToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const { exp } = jwtDecode(token);
    if (exp && exp * 1000 > Date.now()) return token;
  } catch (ex) {}

  localStorage.removeItem("token");
  return null;
}

export function getCurrentUser() {
  const token = getValidToken();
  return token ? jwtDecode(token) : undefined;
}
