import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatTime } from "./YouTubePlayer";

// Mock YT.Player
const mockSeekTo = jest.fn();
const mockGetCurrentTime = jest.fn(() => 30);
const mockSetPlaybackRate = jest.fn();
const mockDestroy = jest.fn();

let onReadyCallback: (() => void) | null = null;

const MockPlayer = jest.fn().mockImplementation((_el: string, options: { events?: { onReady?: (e: { target: unknown; data: number }) => void } }) => {
  onReadyCallback = () => options.events?.onReady?.({ target: {}, data: 0 });
  return {
    seekTo: mockSeekTo,
    getCurrentTime: mockGetCurrentTime,
    getDuration: jest.fn(() => 300),
    setPlaybackRate: mockSetPlaybackRate,
    getPlaybackRate: jest.fn(() => 1),
    getPlayerState: jest.fn(() => 1),
    destroy: mockDestroy,
    loadVideoById: jest.fn(),
    playVideo: jest.fn(),
    pauseVideo: jest.fn(),
  };
});

beforeAll(() => {
  (window as unknown as Record<string, unknown>).YT = {
    Player: MockPlayer,
    PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  onReadyCallback = null;
});

/** Render the player, flush the loadYouTubeAPI promise, and trigger onReady */
async function renderAndReady() {
  const { YouTubePlayer } = await import("./YouTubePlayer");
  const result = render(<YouTubePlayer videoId="testId123" />);

  // Flush the loadYouTubeAPI().then() microtask
  await act(async () => {
    await Promise.resolve();
  });

  // Trigger onReady
  await act(async () => {
    onReadyCallback?.();
  });

  return result;
}

describe("formatTime", () => {
  test("formats seconds to m:ss", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(92)).toBe("1:32");
    expect(formatTime(3661)).toBe("61:01");
  });
});

describe("YouTubePlayer", () => {
  test("renders player container div", async () => {
    await renderAndReady();
    const container = document.querySelector("[class*='aspect-video']");
    expect(container).toBeInTheDocument();
  });

  test("shows controls after player is ready", async () => {
    await renderAndReady();
    expect(screen.getByTestId("player-controls")).toBeInTheDocument();
  });

  test("renders skip buttons", async () => {
    await renderAndReady();
    expect(screen.getByTitle("Skip back 5s")).toBeInTheDocument();
    expect(screen.getByTitle("Skip forward 5s")).toBeInTheDocument();
  });

  test("skip forward calls seekTo with +5", async () => {
    await renderAndReady();
    await userEvent.click(screen.getByTitle("Skip forward 5s"));
    expect(mockSeekTo).toHaveBeenCalledWith(35, true);
  });

  test("skip backward calls seekTo with -5", async () => {
    await renderAndReady();
    await userEvent.click(screen.getByTitle("Skip back 5s"));
    expect(mockSeekTo).toHaveBeenCalledWith(25, true);
  });

  test("renders speed buttons", async () => {
    await renderAndReady();
    expect(screen.getByText("0.5x")).toBeInTheDocument();
    expect(screen.getByText("0.75x")).toBeInTheDocument();
    expect(screen.getByText("1x")).toBeInTheDocument();
    expect(screen.getByText("1.25x")).toBeInTheDocument();
    expect(screen.getByText("1.5x")).toBeInTheDocument();
  });

  test("speed button calls setPlaybackRate", async () => {
    await renderAndReady();
    await userEvent.click(screen.getByText("0.75x"));
    expect(mockSetPlaybackRate).toHaveBeenCalledWith(0.75);
  });

  test("renders A-B loop buttons", async () => {
    await renderAndReady();
    expect(screen.getByTitle("Set loop start")).toBeInTheDocument();
    expect(screen.getByTitle("Set loop end")).toBeInTheDocument();
  });

  test("A button shows timestamp after click", async () => {
    await renderAndReady();
    await userEvent.click(screen.getByTitle("Set loop start"));
    expect(screen.getByText("0:30")).toBeInTheDocument();
  });

  test("loop toggle is disabled without both A and B", async () => {
    await renderAndReady();
    const loopBtn = screen.getByTitle("Enable loop");
    expect(loopBtn).toBeDisabled();
  });

  test("destroys player on unmount", async () => {
    const { unmount } = await renderAndReady();
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
});
