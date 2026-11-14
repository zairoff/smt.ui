import { format } from "date-fns";

// Mirrors the backend enums in SMT.Domain.Feeder (serialized as numbers).

export const MACHINE_VENDOR = { FUJI: 1, PANASONIC: 2 };

export const BOARD_SIDE = { TOP: 1, BOTTOM: 2 };

export const SETUP_STATUS = { DRAFT: 0, ACTIVE: 1, ARCHIVED: 2 };

export const DIFF_CHANGE = { UNCHANGED: 0, ADDED: 1, REMOVED: 2, CHANGED: 3 };

export const vendorKey = (vendor) =>
  vendor === MACHINE_VENDOR.PANASONIC ? "panasonic" : "fuji";

export const sideKey = (side) => (side === BOARD_SIDE.BOTTOM ? "bottom" : "top");

export const statusKey = (status) =>
  ({
    [SETUP_STATUS.DRAFT]: "draft",
    [SETUP_STATUS.ACTIVE]: "active",
    [SETUP_STATUS.ARCHIVED]: "archived",
  }[status]);

export const statusBadge = (status) =>
  ({
    [SETUP_STATUS.DRAFT]: "bg-warning text-dark",
    [SETUP_STATUS.ACTIVE]: "bg-success",
    [SETUP_STATUS.ARCHIVED]: "bg-secondary",
  }[status]);

// Roles allowed to change machine layouts and activate setups (FeederRoles.SetupManagers
// on the backend, where roles are lower case). The JWT "role" claim is a string for one
// role, an array for several.
const SETUP_MANAGER_ROLES = ["admin", "engineer"];

export function isSetupManager(user) {
  if (!user || !user.role) return false;
  const roles = Array.isArray(user.role) ? user.role : [user.role];
  return roles.some((role) => SETUP_MANAGER_ROLES.includes(String(role).toLowerCase()));
}

export const formatDate = (value) =>
  value ? format(new Date(value), "yyyy-MM-dd HH:mm") : "";

export function errorMessage(ex, t) {
  if (ex.response && ex.response.status === 401) return t("feeder:errors.loginRequired");
  if (ex.response && ex.response.status === 403) return t("feeder:errors.forbidden");
  return (
    (ex.response && ex.response.data && ex.response.data.message) || ex.message
  );
}
