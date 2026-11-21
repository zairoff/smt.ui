import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "../../i18n/i18n";
import i18n from "../../i18n/i18n";
import Documents, { formatSize } from "./documents";
import { getOwners, listFolder, uploadFile } from "../../services/documentService";

jest.mock("../../services/documentService", () => ({
  getOwners: jest.fn(),
  listFolder: jest.fn(),
  downloadFile: jest.fn(),
  uploadFile: jest.fn(),
  createFolder: jest.fn(),
  renameEntry: jest.fn(),
  deleteEntry: jest.fn(),
}));

const owners = [
  // "title" is what the page shows; folders arrive already sorted by step number.
  { username: "ali", title: "1 Метрология", isAdmin: false },
  { username: "bob", isAdmin: false },
];

const listing = (owner, canEdit) => ({
  owner,
  path: "",
  canEdit,
  entries: [
    { name: "BOM", isFolder: true, size: 0, modified: "2026-11-20T10:00:00" },
    { name: "gerber.zip", isFolder: false, size: 2048, modified: "2026-11-20T10:00:00" },
  ],
});

const renderPage = (user) =>
  render(
    <MemoryRouter>
      <Documents user={user} />
    </MemoryRouter>
  );

beforeEach(() => {
  i18n.changeLanguage("en");
  jest.resetAllMocks();
  window.history.replaceState(null, "", "/documents");
  getOwners.mockResolvedValue({ data: owners });
  listFolder.mockImplementation((owner) =>
    Promise.resolve({ data: listing(owner, owner === "bob") })
  );
});

test("opens the user's own folder with edit actions", async () => {
  renderPage({ username: "bob", role: "Engineer" });

  expect(await screen.findByText("gerber.zip")).toBeInTheDocument();
  expect(listFolder).toHaveBeenCalledWith("bob", "");
  expect(screen.getByText("Upload files")).toBeInTheDocument();
  expect(screen.getAllByText("Delete")).toHaveLength(2);
});

test("other people's folders are view-only", async () => {
  renderPage({ username: "bob", role: "Engineer" });
  await screen.findByText("gerber.zip");

  fireEvent.click(screen.getByText("1 Метрология"));

  expect(await screen.findByText(/View only/)).toBeInTheDocument();
  expect(listFolder).toHaveBeenLastCalledWith("ali", "");
  expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  expect(screen.queryByText("Upload files")).not.toBeInTheDocument();
  expect(screen.getByText("Download")).toBeInTheDocument();
});

test("asks before replacing an existing file", async () => {
  const confirm = jest.spyOn(window, "confirm").mockReturnValue(true);
  uploadFile
    .mockRejectedValueOnce({ response: { status: 409, data: { message: "exists" } } })
    .mockResolvedValueOnce({ data: {} });

  const { container } = renderPage({ username: "bob", role: "Engineer" });
  await screen.findByText("gerber.zip");

  const file = new File(["x"], "gerber.zip");
  fireEvent.change(container.querySelector('input[type="file"]'), { target: { files: [file] } });

  await waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(2));
  expect(confirm).toHaveBeenCalled();
  expect(uploadFile.mock.calls[0][3]).toBe(false);
  expect(uploadFile.mock.calls[1][3]).toBe(true);
  confirm.mockRestore();
});

test("explains when the account has no folder access", async () => {
  getOwners.mockRejectedValue({ response: { status: 403, data: {} } });

  renderPage({ username: "line1", role: "user" });

  expect(await screen.findByText(/no document folder access/)).toBeInTheDocument();
});

test("formats sizes", () => {
  expect(formatSize(500)).toBe("500 B");
  expect(formatSize(2048)).toBe("2.0 KB");
  expect(formatSize(5 * 1024 * 1024)).toBe("5.0 MB");
});

test("shows folder titles instead of logins", async () => {
  renderPage({ username: "bob", role: "Engineer" });
  await screen.findByText("gerber.zip");

  expect(screen.getByText("1 Метрология")).toBeInTheDocument();
  expect(screen.queryByText("ali")).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("1 Метрология"));
  await waitFor(() => expect(listFolder).toHaveBeenLastCalledWith("ali", ""));
});
