import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { formatTime } from "./YouTubePlayer";

// Mock Radix Slider (doesn't work in jsdom)
jest.mock("@/components/ui/slider", () => ({
  Slider: (props: Record<string, unknown>) => (
    <div data-testid={props["data-testid"] as string} data-slot="slider" />
  ),
}));

// Mock YT.Player
const mockSeekTo = jest.fn();
const mockGetCurrentTime = jest.fn(() => 30);
const mockSetPlaybackRate = jest.fn();
const mockDestroy = jest.fn();

let onReadyCallback: (() => void) | null = null;

const mockGetDuration = jest.fn(() => 300);

const MockPlayer = jest.fn().mockImplementation((_el: string, options: { events?: { onReady?: (e: { target: unknown; data: number }) => void } }) => {
  const player = {
    seekTo: mockSeekTo,
    getCurrentTime: mockGetCurrentTime,
    getDuration: mockGetDuration,
    setPlaybackRate: mockSetPlaybackRate,
    getPlaybackRate: jest.fn(() => 1),
    getPlayerState: jest.fn(() => 1),
    destroy: mockDestroy,
    loadVideoById: jest.fn(),
    playVideo: jest.fn(),
    pauseVideo: jest.fn(),
  };
  onReadyCallback = () => options.events?.onReady?.({ target: player, data: 0 });
  return player;
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

  test("renders speed buttons with slow and fast groups", async () => {
    await renderAndReady();
    expect(screen.getByText("0.25x")).toBeInTheDocument();
    expect(screen.getByText("0.5x")).toBeInTheDocument();
    expect(screen.getByText("0.75x")).toBeInTheDocument();
    expect(screen.getByText("0.9x")).toBeInTheDocument();
    expect(screen.getByText("1x")).toBeInTheDocument();
    expect(screen.getByText("1.5x")).toBeInTheDocument();
    expect(screen.getByText("2x")).toBeInTheDocument();
  });

  test("speed button calls setPlaybackRate", async () => {
    await renderAndReady();
    await userEvent.click(screen.getByText("0.75x"));
    expect(mockSetPlaybackRate).toHaveBeenCalledWith(0.75);
  });

  test("renders loop range slider", async () => {
    await renderAndReady();
    expect(screen.getByTestId("loop-slider")).toBeInTheDocument();
  });

  test("renders loop toggle button", async () => {
    await renderAndReady();
    expect(screen.getByTitle("Enable loop")).toBeInTheDocument();
  });

  test("renders restart button", async () => {
    await renderAndReady();
    expect(screen.getByTestId("restart-loop")).toBeInTheDocument();
    expect(screen.getByTitle("Restart from beginning")).toBeInTheDocument();
  });

  test("restart button seeks to 0 when no loop is set", async () => {
    await renderAndReady();
    await userEvent.click(screen.getByTestId("restart-loop"));
    expect(mockSeekTo).toHaveBeenCalledWith(0, true);
  });

  test("destroys player on unmount", async () => {
    const { unmount } = await renderAndReady();
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });
});
