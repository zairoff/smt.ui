import config from "../../config.json";
import http from "../httpService";

const endPoint = config.apiUrl + "boardV2";

// Records a scan and returns the board's up-to-date state.
// Expected response: { id, qrCode, model, lineId, line, currentQrReaderId, currentQrReader, status, startedAt, updatedAt, completedAt }
export function scanBoard(qrCode, qrReaderId) {
  return http.post(endPoint + "/Scan", { qrCode, qrReaderId });
}

// Live per-station snapshot for a line: how many boards are currently sitting
// past each checkpoint (InProgress/Flagged), plus a Completed count for the date range.
// Expected response: { lineId, lineName, stations: [{readerId, readerName, position, inProgressCount, flaggedCount}], completedCount }
export function getLineSnapshot(lineId, from, to) {
  const query =
    endPoint + "/Snapshot?lineId=" + lineId + "&from=" + from + "&to=" + to;
  return http.get(query);
}

// The whole-process view: every configured line's live snapshot in one call.
// Expected response: [{ lineId, lineName, stations: [...], completedCount }, ...]
export function getAllLineSnapshots(from, to) {
  const query = endPoint + "/Snapshots?from=" + from + "&to=" + to;
  return http.get(query);
}

// The actual list of boards currently flagged (skipped a station / out of sequence).
export function getFlaggedBoards(lineId) {
  let query = endPoint + "/Flagged";
  if (lineId) query += "?lineId=" + lineId;
  return http.get(query);
}

// The actual boards currently sitting at one station (InProgress + Flagged) -
// the boards behind that station's live counts.
export function getBoardsAtStation(readerId) {
  const query = endPoint + "/AtStation?readerId=" + readerId;
  return http.get(query);
}

// Full movement history for one physical board.
// Expected response: { board: {...}, movements: [{id, qrReaderId, qrReaderName, dateTime, status}, ...] }
export function getBoardHistory(qrCode) {
  const query = endPoint + "/History?qrCode=" + encodeURIComponent(qrCode);
  return http.get(query);
}

// The scan report log for a given date - source of truth, survives refresh.
// Expected response: [{ id, qrCode, modelName, qrReaderId, qrReaderName, lineName, dateTime, status }, ...]
export function getRecentMovements(date) {
  const query = endPoint + "/RecentMovements?date=" + date;
  return http.get(query);
}
