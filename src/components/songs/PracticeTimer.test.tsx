import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PracticeTimer } from "./PracticeTimer";
import { updatePracticeTime } from "@/lib/fileService";

jest.mock("@/lib/fileService", () => ({
  updatePracticeTime: jest.fn(),
}));

jest.mock("@/lib/practiceSessionService", () => ({
  logPracticeSession: jest.fn(),
}));

const mockUpdatePracticeTime = updatePracticeTime as jest.Mock;

describe("PracticeTimer", () => {
  const defaultProps = { songId: "song-1", songName: "Test Song", initialSeconds: 0 };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders initial time as 00:00 when starting from 0", () => {
    render(<PracticeTimer {...defaultProps} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  test("starts from initialSeconds", () => {
    render(<PracticeTimer {...defaultProps} initialSeconds={125} />);
    // 125s = 0h 2m → 00:02
    expect(screen.getByText("00:02")).toBeInTheDocument();
  });

  test("shows HH:MM format for hours", () => {
    render(<PracticeTimer {...defaultProps} initialSeconds={3661} />);
    // 3661s = 1h 1m → 01:01
    expect(screen.getByText("01:01")).toBeInTheDocument();
  });

  test("auto-starts and increments every second", () => {
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(60000); // 60 seconds
    });

    expect(screen.getByText("00:01")).toBeInTheDocument();
  });

  test("formats minutes correctly", () => {
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(125000); // 2 min 5 sec → 00:02
    });

    expect(screen.getByText("00:02")).toBeInTheDocument();
  });

  test("pause button stops the timer", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(120000); // 2 minutes
    });
    expect(screen.getByText("00:02")).toBeInTheDocument();

    // Click pause
    const pauseButton = screen.getByRole("button");
    await user.click(pauseButton);

    act(() => {
      jest.advanceTimersByTime(60000); // 1 more minute while paused
    });

    // Should still be 00:02 after pause
    expect(screen.getByText("00:02")).toBeInTheDocument();
  });

  test("resume after pause continues counting", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute
    });

    // Pause
    await user.click(screen.getByRole("button"));

    // Resume
    await user.click(screen.getByRole("button"));

    act(() => {
      jest.advanceTimersByTime(60000); // 1 more minute
    });

    expect(screen.getByText("00:02")).toBeInTheDocument();
  });

  test("saves delta to Firestore on unmount", () => {
    const { unmount } = render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(10000); // 10 seconds
    });

    unmount();

    expect(mockUpdatePracticeTime).toHaveBeenCalledWith("song-1", 10);
  });

  test("does not save if no time elapsed", () => {
    const { unmount } = render(<PracticeTimer {...defaultProps} />);
    unmount();

    expect(mockUpdatePracticeTime).not.toHaveBeenCalled();
  });

  test("auto-saves every 30 seconds", () => {
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(30000);
    });

    expect(mockUpdatePracticeTime).toHaveBeenCalledWith("song-1", 30);
  });

  test("unmount saves only unsaved delta after auto-save", () => {
    const { unmount } = render(<PracticeTimer {...defaultProps} />);

    // 30s auto-save fires
    act(() => {
      jest.advanceTimersByTime(35000);
    });

    expect(mockUpdatePracticeTime).toHaveBeenCalledWith("song-1", 30);
    mockUpdatePracticeTime.mockClear();

    unmount();

    // Only 5 more seconds since last auto-save
    expect(mockUpdatePracticeTime).toHaveBeenCalledWith("song-1", 5);
  });

  describe("video-controlled mode", () => {
    test("does not auto-start when isPlaying is false", () => {
      render(<PracticeTimer {...defaultProps} isPlaying={false} />);

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(screen.getByText("00:00")).toBeInTheDocument();
    });

    test("starts counting when isPlaying becomes true", () => {
      const { rerender } = render(<PracticeTimer {...defaultProps} isPlaying={false} />);

      rerender(<PracticeTimer {...defaultProps} isPlaying={true} />);

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      expect(screen.getByText("00:01")).toBeInTheDocument();
    });

    test("pauses when isPlaying becomes false", () => {
      const { rerender } = render(<PracticeTimer {...defaultProps} isPlaying={true} />);

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      rerender(<PracticeTimer {...defaultProps} isPlaying={false} />);

      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Should still be 1 minute, not 2
      expect(screen.getByText("00:01")).toBeInTheDocument();
    });

    test("hides manual toggle button when video-controlled", () => {
      render(<PracticeTimer {...defaultProps} isPlaying={false} />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    test("saves on unmount in video-controlled mode", () => {
      const { unmount } = render(<PracticeTimer {...defaultProps} isPlaying={true} />);

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      unmount();

      expect(mockUpdatePracticeTime).toHaveBeenCalledWith("song-1", 10);
    });
  });
});
