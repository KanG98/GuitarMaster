import { extractVideoId, buildGuitarTabQuery, searchYouTube } from "./youtubeService";

describe("extractVideoId", () => {
  test("extracts from standard YouTube URL", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("extracts from short YouTube URL (youtu.be)", () => {
    expect(extractVideoId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("extracts from embed URL", () => {
    expect(extractVideoId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("extracts from shorts URL", () => {
    expect(extractVideoId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("returns raw 11-char video ID as-is", () => {
    expect(extractVideoId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("returns null for invalid input", () => {
    expect(extractVideoId("not a url")).toBeNull();
  });

  test("returns null for empty string", () => {
    expect(extractVideoId("")).toBeNull();
  });

  test("extracts from URL with extra params", () => {
    expect(extractVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120")).toBe("dQw4w9WgXcQ");
  });
});

describe("buildGuitarTabQuery", () => {
  test("combines song name, artist, and 'guitar tab'", () => {
    expect(buildGuitarTabQuery("Hotel California", "Eagles")).toBe("Hotel California Eagles guitar tab");
  });

  test("handles missing artist", () => {
    expect(buildGuitarTabQuery("Wonderwall", "")).toBe("Wonderwall guitar tab");
  });
});

describe("searchYouTube", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls /api/youtube/search with encoded query", async () => {
    const mockResults = [{ videoId: "abc", title: "Test", channelTitle: "Ch", thumbnail: "url" }];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: mockResults }),
    });

    const results = await searchYouTube("test query");

    expect(global.fetch).toHaveBeenCalledWith("/api/youtube/search?q=test%20query");
    expect(results).toEqual(mockResults);
  });

  test("throws on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "fail" }),
    });

    await expect(searchYouTube("test")).rejects.toThrow("YouTube search failed");
  });

  test("returns parsed results", async () => {
    const mockResults = [
      { videoId: "v1", title: "Song 1", channelTitle: "Ch1", thumbnail: "thumb1" },
      { videoId: "v2", title: "Song 2", channelTitle: "Ch2", thumbnail: "thumb2" },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ results: mockResults }),
    });

    const results = await searchYouTube("guitar tab");
    expect(results).toHaveLength(2);
    expect(results[0].videoId).toBe("v1");
    expect(results[1].videoId).toBe("v2");
  });
});
