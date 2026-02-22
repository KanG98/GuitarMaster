import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YouTubeSection } from "./YouTubeSection";

// Mock YouTubePlayer since it requires the YouTube IFrame API
jest.mock("./YouTubePlayer", () => ({
  YouTubePlayer: ({ videoId }: { videoId: string }) => (
    <div data-testid="youtube-player" data-video-id={videoId}>
      Mocked Player
    </div>
  ),
}));

const defaultProps = {
  videoId: null as string | null,
  songName: "Hotel California",
  artist: "Eagles",
  isSearching: false,
  searchResults: [] as { videoId: string; title: string; channelTitle: string; thumbnail: string }[],
  onSearch: jest.fn(),
  onSelectVideo: jest.fn(),
  onRemoveVideo: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("YouTubeSection", () => {
  test("shows placeholder when no videoId and not searching", () => {
    render(<YouTubeSection {...defaultProps} />);
    expect(screen.getByText("No video linked")).toBeInTheDocument();
    expect(screen.getByText("Search YouTube")).toBeInTheDocument();
  });

  test("shows searching state", () => {
    render(<YouTubeSection {...defaultProps} isSearching={true} />);
    expect(screen.getByText("Searching YouTube...")).toBeInTheDocument();
  });

  test("renders player when videoId is provided", () => {
    render(<YouTubeSection {...defaultProps} videoId="dQw4w9WgXcQ" />);
    const player = screen.getByTestId("youtube-player");
    expect(player).toBeInTheDocument();
    expect(player).toHaveAttribute("data-video-id", "dQw4w9WgXcQ");
  });

  test("shows edit button when video is present", () => {
    render(<YouTubeSection {...defaultProps} videoId="dQw4w9WgXcQ" />);
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  test("edit button opens edit controls", async () => {
    render(<YouTubeSection {...defaultProps} videoId="dQw4w9WgXcQ" />);
    await userEvent.click(screen.getByText("Edit"));
    expect(screen.getByText("Change video")).toBeInTheDocument();
    expect(screen.getByText("Search YouTube")).toBeInTheDocument();
    expect(screen.getByText("Remove")).toBeInTheDocument();
  });

  test("calls onSearch when Search YouTube is clicked", async () => {
    const onSearch = jest.fn();
    render(<YouTubeSection {...defaultProps} onSearch={onSearch} />);
    await userEvent.click(screen.getByText("Search YouTube"));
    expect(onSearch).toHaveBeenCalledWith("Hotel California Eagles guitar tab");
  });

  test("displays search results", () => {
    const results = [
      { videoId: "v1", title: "Result 1", channelTitle: "Channel 1", thumbnail: "https://img.youtube.com/1.jpg" },
      { videoId: "v2", title: "Result 2", channelTitle: "Channel 2", thumbnail: "https://img.youtube.com/2.jpg" },
    ];
    render(<YouTubeSection {...defaultProps} searchResults={results} />);
    expect(screen.getByText("Result 1")).toBeInTheDocument();
    expect(screen.getByText("Result 2")).toBeInTheDocument();
    expect(screen.getByText("Channel 1")).toBeInTheDocument();
  });

  test("calls onSelectVideo when a result is clicked", async () => {
    const onSelectVideo = jest.fn();
    const results = [
      { videoId: "v1", title: "Result 1", channelTitle: "Channel 1", thumbnail: "https://img.youtube.com/1.jpg" },
    ];
    render(<YouTubeSection {...defaultProps} searchResults={results} onSelectVideo={onSelectVideo} />);
    await userEvent.click(screen.getByText("Result 1"));
    expect(onSelectVideo).toHaveBeenCalledWith("v1");
  });

  test("calls onRemoveVideo when remove button is clicked", async () => {
    const onRemoveVideo = jest.fn();
    render(<YouTubeSection {...defaultProps} videoId="dQw4w9WgXcQ" onRemoveVideo={onRemoveVideo} />);
    // Enter edit mode
    await userEvent.click(screen.getByText("Edit"));
    await userEvent.click(screen.getByText("Remove"));
    expect(onRemoveVideo).toHaveBeenCalledTimes(1);
  });

  test("handles paste URL with valid YouTube URL", async () => {
    const onSelectVideo = jest.fn();
    render(<YouTubeSection {...defaultProps} onSelectVideo={onSelectVideo} />);

    const input = screen.getByPlaceholderText("Paste YouTube URL...");
    await userEvent.type(input, "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    await userEvent.click(screen.getByText("Set"));

    expect(onSelectVideo).toHaveBeenCalledWith("dQw4w9WgXcQ");
  });

  test("shows error for invalid YouTube URL", async () => {
    render(<YouTubeSection {...defaultProps} />);

    const input = screen.getByPlaceholderText("Paste YouTube URL...");
    await userEvent.type(input, "not-a-url");
    await userEvent.click(screen.getByText("Set"));

    expect(screen.getByText("Invalid YouTube URL")).toBeInTheDocument();
  });
});
