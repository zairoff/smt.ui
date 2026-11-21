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

// The JWT's "role" claim is a string for one role and an array for several.
// Role names exist in both cases ("admin"/"Admin"), so compare case-insensitively.
export function userHasRole(user, role) {
  if (!user || !user.role) return false;
  const roles = Array.isArray(user.role) ? user.role : [user.role];
  return roles.some((r) => String(r).toLowerCase() === role.toLowerCase());
}

export function getCurrentUser() {
  const token = getValidToken();
  return token ? jwtDecode(token) : undefined;
}
