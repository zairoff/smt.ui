import { format } from "date-fns";

// Mirrors the backend enums in SMT.Domain.Feeder (serialized as numbers).

export const MACHINE_VENDOR = { FUJI: 1, PANASONIC: 2 };

export const BOARD_SIDE = { TOP: 1, BOTTOM: 2 };

export const SETUP_STATUS = { DRAFT: 0, ACTIVE: 1, ARCHIVED: 2 };

export const DIFF_CHANGE = { UNCHANGED: 0, ADDED: 1, REMOVED: 2, CHANGED: 3 };

export const SCAN_RESULT = { OK: 0, OK_ALTERNATE: 1, NG: 2 };

export const NG_REASON = {
  1: "UnknownReel",
  2: "UnknownSlot",
  3: "WrongSlot",
  4: "NotInSetup",
  5: "NoActiveSetup",
  6: "DuplicateReel",
  7: "WrongLine",
};

// Slot stickers carry codes like FS-3-M2-07 (FeederCodes.SlotCodePrefix on the backend).
export const isSlotCode = (code) => /^FS-/i.test((code || "").trim());

export const slotLabel = (target) => (target ? `${target.moduleName} · ${target.slotNumber}` : "");

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

export const formatDate = (value) =>
  value ? format(new Date(value), "yyyy-MM-dd HH:mm") : "";

export function errorMessage(ex) {
  return (
    (ex.response && ex.response.data && ex.response.data.message) || ex.message
  );
}
