import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "../../i18n/i18n";
import i18n from "../../i18n/i18n";
import DataAssistant from "./dataAssistant";
import { ask } from "../../services/assistantService";

jest.mock("../../services/assistantService", () => ({ ask: jest.fn() }));

beforeEach(() => {
  i18n.changeLanguage("en");
  ask.mockReset();
});

test("asks logged-out users to log in", () => {
  render(<DataAssistant user={undefined} />);
  expect(screen.getByText("Please log in to use the data assistant.")).toBeInTheDocument();
});

test("shows the answer, its table and sources, and sends history on follow-ups", async () => {
  ask.mockResolvedValueOnce({
    data: {
      answer: "Tombstone was the top defect yesterday.",
      columns: ["Defect", "Count"],
      rows: [["Tombstone", "12"], ["Bridge", "4"]],
      sources: ["defect_ranking(group_by=defect)"],
    },
  });

  render(<DataAssistant user={{ username: "qa" }} />);
  fireEvent.click(screen.getByText("What were the top 5 defects yesterday?"));

  expect(await screen.findByText("Tombstone was the top defect yesterday.")).toBeInTheDocument();
  expect(screen.getByText("Bridge")).toBeInTheDocument();
  expect(screen.getByText("defect_ranking(group_by=defect)")).toBeInTheDocument();
  expect(ask).toHaveBeenCalledWith("What were the top 5 defects yesterday?", "en", []);

  ask.mockResolvedValueOnce({ data: { answer: "On line 2: Bridge.", columns: [], rows: [], sources: [] } });
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "And on line 2?" } });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));

  await waitFor(() => expect(ask).toHaveBeenCalledTimes(2));
  expect(ask.mock.calls[1][2]).toEqual([
    { role: "user", text: "What were the top 5 defects yesterday?" },
    { role: "assistant", text: "Tombstone was the top defect yesterday." },
  ]);
  expect(await screen.findByText("On line 2: Bridge.")).toBeInTheDocument();
});

test("shows the server's message when the assistant is unavailable", async () => {
  ask.mockRejectedValueOnce({
    response: { status: 503, data: { message: "The data assistant is temporarily unavailable." } },
  });

  render(<DataAssistant user={{ username: "qa" }} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "FTQ today?" } });
  fireEvent.click(screen.getByRole("button", { name: "Ask" }));

  expect(await screen.findByText("The data assistant is temporarily unavailable.")).toBeInTheDocument();
});
