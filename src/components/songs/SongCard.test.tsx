import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SongCard } from "./SongCard";
import { SongRecord } from "@/lib/fileService";

describe("SongCard", () => {
  const mockSong: SongRecord = {
    id: "song-1",
    name: "Hotel California",
    artist: "Eagles",
    totalPracticeSeconds: 0,
    practicing: false,
    pinned: false,
    youtubeVideoId: null,
    youtubeBackingTrackId: null,
    createdAt: new Date(),
  };

  const defaultProps = {
    song: mockSong,
    onClick: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders song name and artist", () => {
    render(<SongCard {...defaultProps} />);
    expect(screen.getByText("Hotel California")).toBeInTheDocument();
    expect(screen.getByText("Eagles")).toBeInTheDocument();
  });

  test("does not render artist when empty", () => {
    const songNoArtist = { ...mockSong, artist: "" };
    render(<SongCard {...defaultProps} song={songNoArtist} />);
    expect(screen.getByText("Hotel California")).toBeInTheDocument();
    expect(screen.queryByText("Eagles")).not.toBeInTheDocument();
  });

  test("calls onClick when card is clicked", async () => {
    const onClick = jest.fn();
    render(<SongCard {...defaultProps} onClick={onClick} />);

    await userEvent.click(screen.getByText("Hotel California"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("shows practice time when totalPracticeSeconds > 0", () => {
    const songWithTime = { ...mockSong, totalPracticeSeconds: 754 };
    render(<SongCard {...defaultProps} song={songWithTime} />);
    expect(screen.getByText("12m practiced")).toBeInTheDocument();
  });

  test("shows hours and minutes for long practice time", () => {
    const songWithTime = { ...mockSong, totalPracticeSeconds: 4980 };
    render(<SongCard {...defaultProps} song={songWithTime} />);
    expect(screen.getByText("1h 23m practiced")).toBeInTheDocument();
  });

  test("shows seconds for short practice time", () => {
    const songWithTime = { ...mockSong, totalPracticeSeconds: 45 };
    render(<SongCard {...defaultProps} song={songWithTime} />);
    expect(screen.getByText("45s practiced")).toBeInTheDocument();
  });

  test("does not show practice time when totalPracticeSeconds is 0", () => {
    render(<SongCard {...defaultProps} />);
    expect(screen.queryByText(/practiced/)).not.toBeInTheDocument();
  });

  test("shows highlighted ring when highlighted prop is true", () => {
    const { container } = render(<SongCard {...defaultProps} highlighted />);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("ring-primary");
  });
});
