import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SongLookupDialog } from "./SongLookupDialog";
import { SongRecord } from "@/lib/fileService";

// Mock fetch
global.fetch = jest.fn();

const mockOnAddSong = jest.fn().mockResolvedValue(undefined);
const mockOnOpenChange = jest.fn();
const mockOnMatchFound = jest.fn();
const mockOnNavigateToSong = jest.fn();

const defaultProps = {
  open: true,
  onOpenChange: mockOnOpenChange,
  onAddSong: mockOnAddSong,
  foldersReady: true,
  songs: [] as SongRecord[],
  onMatchFound: mockOnMatchFound,
  onNavigateToSong: mockOnNavigateToSong,
};

// Helper to create a mock SongRecord
function makeSong(overrides: Partial<SongRecord> = {}): SongRecord {
  return {
    id: overrides.id || "test-id",
    name: overrides.name || "Test Song",
    artist: overrides.artist || "Test Artist",
    totalPracticeSeconds: 0,
    practicing: false,
    pinned: false,
    youtubeVideoId: null,
    youtubeBackingTrackId: null,
    createdAt: new Date(),
  };
}

describe("SongLookupDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
  });

  test("renders the search input", () => {
    render(<SongLookupDialog {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(/search song name/i)
    ).toBeInTheDocument();
  });

  test("shows local matches from existing songs", async () => {
    const songs = [makeSong({ id: "1", name: "晴天", artist: "周杰伦" })];
    render(<SongLookupDialog {...defaultProps} songs={songs} />);

    const input = screen.getByPlaceholderText(/search song name/i);
    await userEvent.type(input, "晴天");

    await waitFor(() => {
      expect(screen.getByText("晴天")).toBeInTheDocument();
    });
  });

  test("does NOT mark new song as already exists just because artist matches", async () => {
    // User has "晴天" by "周杰伦" in their list
    const songs = [makeSong({ id: "1", name: "晴天", artist: "周杰伦" })];

    // Search returns "搁浅.pdf" from path "周杰伦/搁浅.pdf"
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            relativePath: "周杰伦/搁浅.pdf",
            fileName: "搁浅.pdf",
            size: 1024,
            type: "application/pdf",
          },
        ],
      }),
    });

    render(<SongLookupDialog {...defaultProps} songs={songs} />);

    const input = screen.getByPlaceholderText(/search song name/i);
    await userEvent.clear(input);
    await userEvent.type(input, "搁浅");

    // Click search button
    const searchBtn = screen.getByRole("button", { name: /search/i });
    await userEvent.click(searchBtn);

    await waitFor(() => {
      // The "Add" button should be visible (not "Added")
      expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    });

    // Should NOT show "In your list" badge for the search result
    expect(screen.queryByText("In your list")).not.toBeInTheDocument();
  });

  test("marks song as already exists when name AND artist both match", async () => {
    // User has "搁浅" by "周杰伦" in their list
    const songs = [makeSong({ id: "1", name: "搁浅", artist: "周杰伦" })];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            relativePath: "周杰伦/搁浅.pdf",
            fileName: "搁浅.pdf",
            size: 1024,
            type: "application/pdf",
          },
        ],
      }),
    });

    render(<SongLookupDialog {...defaultProps} songs={songs} />);

    const input = screen.getByPlaceholderText(/search song name/i);
    await userEvent.clear(input);
    await userEvent.type(input, "搁浅");

    const searchBtn = screen.getByRole("button", { name: /search/i });
    await userEvent.click(searchBtn);

    await waitFor(() => {
      // Should show "Added" button since song already exists
      expect(screen.getByRole("button", { name: "Added" })).toBeInTheDocument();
    });
  });
});
