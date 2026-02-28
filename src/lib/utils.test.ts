import { formatTime, formatPracticeTime } from "./utils";

describe("formatTime", () => {
  it("should format seconds correctly", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(30)).toBe("0:30");
    expect(formatTime(59)).toBe("0:59");
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(90)).toBe("1:30");
    expect(formatTime(3661)).toBe("61:01"); // Over an hour, still shows as minutes
  });

  it("should handle decimal seconds by flooring", () => {
    expect(formatTime(59.9)).toBe("0:59");
    expect(formatTime(60.1)).toBe("1:00");
  });
});

describe("formatPracticeTime", () => {
  it("should format seconds only for times under 1 minute", () => {
    expect(formatPracticeTime(0)).toBe("0s");
    expect(formatPracticeTime(30)).toBe("30s");
    expect(formatPracticeTime(59)).toBe("59s");
  });

  it("should format minutes for times under 1 hour", () => {
    expect(formatPracticeTime(60)).toBe("1m");
    expect(formatPracticeTime(90)).toBe("1m");
    expect(formatPracticeTime(120)).toBe("2m");
    expect(formatPracticeTime(3540)).toBe("59m"); // 59 minutes
  });

  it("should format hours and minutes for times over 1 hour", () => {
    expect(formatPracticeTime(3600)).toBe("1h 0m");
    expect(formatPracticeTime(3660)).toBe("1h 1m");
    expect(formatPracticeTime(7260)).toBe("2h 1m");
    expect(formatPracticeTime(14400)).toBe("4h 0m");
  });
});