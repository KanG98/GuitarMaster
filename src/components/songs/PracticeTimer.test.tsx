import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PracticeTimer } from "./PracticeTimer";
import { updatePracticeTime } from "@/lib/fileService";

jest.mock("@/lib/fileService", () => ({
  updatePracticeTime: jest.fn(),
}));

const mockUpdatePracticeTime = updatePracticeTime as jest.Mock;

describe("PracticeTimer", () => {
  const defaultProps = { songId: "song-1", initialSeconds: 0 };

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
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });

  test("shows HH:MM:SS format when >= 1 hour", () => {
    render(<PracticeTimer {...defaultProps} initialSeconds={3661} />);
    // 1h 1m 1s
    expect(screen.getByText("01:01:01")).toBeInTheDocument();
  });

  test("auto-starts and increments every second", () => {
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(screen.getByText("00:03")).toBeInTheDocument();
  });

  test("formats minutes correctly", () => {
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(65000); // 1 min 5 sec
    });

    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  test("pause button stops the timer", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.getByText("00:05")).toBeInTheDocument();

    // Click pause
    const pauseButton = screen.getByRole("button");
    await user.click(pauseButton);

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    // Should still be 00:05 after pause
    expect(screen.getByText("00:05")).toBeInTheDocument();
  });

  test("resume after pause continues counting", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PracticeTimer {...defaultProps} />);

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    // Pause
    await user.click(screen.getByRole("button"));

    // Resume
    await user.click(screen.getByRole("button"));

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(screen.getByText("00:05")).toBeInTheDocument();
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
});
