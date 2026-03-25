import { render, screen } from "@testing-library/react";
import { PracticeStats } from "./PracticeStats";
import { PracticeSession } from "@/lib/practiceStats";

// Mock the session service
const mockSessions: PracticeSession[] = [
  { songId: "a", songName: "Hotel California", seconds: 1800, date: "2026-03-22" },
  { songId: "b", songName: "Stairway to Heaven", seconds: 900, date: "2026-03-22" },
  { songId: "a", songName: "Hotel California", seconds: 600, date: "2026-03-23" },
  { songId: "a", songName: "Hotel California", seconds: 300, date: "2026-03-24" },
];

jest.mock("@/lib/practiceSessionService", () => ({
  getPracticeSessions: jest.fn(() => Promise.resolve(mockSessions)),
}));

describe("PracticeStats", () => {
  it("renders the dashboard heading", async () => {
    render(<PracticeStats />);
    expect(screen.getByText("Practice Stats")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    render(<PracticeStats />);
    expect(screen.getByTestId("stats-loading")).toBeInTheDocument();
  });

  it("shows total practice time after loading", async () => {
    render(<PracticeStats />);
    await screen.findByTestId("total-time");
    expect(screen.getByTestId("total-time")).toBeInTheDocument();
  });

  it("shows streak count", async () => {
    render(<PracticeStats />);
    await screen.findByTestId("streak-count");
    expect(screen.getByTestId("streak-count")).toBeInTheDocument();
  });

  it("shows song breakdown section", async () => {
    render(<PracticeStats />);
    await screen.findByTestId("song-breakdown");
    expect(screen.getByTestId("song-breakdown")).toBeInTheDocument();
  });

  it("shows daily chart section", async () => {
    render(<PracticeStats />);
    await screen.findByTestId("daily-chart");
    expect(screen.getByTestId("daily-chart")).toBeInTheDocument();
  });

  it("shows empty state when no sessions", async () => {
    // Override mock to return empty
    const { getPracticeSessions } = require("@/lib/practiceSessionService");
    getPracticeSessions.mockResolvedValueOnce([]);
    render(<PracticeStats />);
    await screen.findByTestId("stats-empty");
    expect(screen.getByTestId("stats-empty")).toBeInTheDocument();
  });
});
