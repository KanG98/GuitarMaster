import {
  mockAddDoc,
  mockGetDocs,
  mockDeleteDoc,
  mockUpdateDoc,
  mockIncrement,
  mockUploadBytes,
  mockGetDownloadURL,
} from "@/__mocks__/firebase";

import {
  createSong,
  getSongs,
  deleteSong,
  uploadFile,
  getFiles,
  deleteFile,
  updateFileOrder,
  updatePracticeTime,
} from "./fileService";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Song CRUD", () => {
  test("createSong creates a song and returns SongRecord", async () => {
    mockAddDoc.mockResolvedValue({ id: "song-1" });

    const result = await createSong("Hotel California", "Eagles");

    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("song-1");
    expect(result.name).toBe("Hotel California");
    expect(result.artist).toBe("Eagles");
    expect(result.totalPracticeSeconds).toBe(0);
    expect(result.createdAt).toBeInstanceOf(Date);
  });

  test("getSongs returns sorted songs", async () => {
    const now = new Date();
    const earlier = new Date(now.getTime() - 10000);

    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "s1",
          data: () => ({ name: "Song A", artist: "Art A", createdAt: { toDate: () => earlier } }),
        },
        {
          id: "s2",
          data: () => ({ name: "Song B", artist: "Art B", createdAt: { toDate: () => now } }),
        },
      ],
    });

    const songs = await getSongs();

    expect(songs).toHaveLength(2);
    expect(songs[0].id).toBe("s2"); // newer first
    expect(songs[1].id).toBe("s1");
  });

  test("getSongs handles missing artist gracefully", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "s1",
          data: () => ({ name: "Song A", createdAt: { toDate: () => new Date() } }),
        },
      ],
    });

    const songs = await getSongs();
    expect(songs[0].artist).toBe("");
  });

  test("getSongs returns totalPracticeSeconds defaulting to 0", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "s1",
          data: () => ({ name: "Song A", artist: "Art A", totalPracticeSeconds: 120, createdAt: { toDate: () => new Date() } }),
        },
        {
          id: "s2",
          data: () => ({ name: "Song B", createdAt: { toDate: () => new Date() } }),
        },
      ],
    });

    const songs = await getSongs();
    expect(songs[0].totalPracticeSeconds).toBe(120);
    expect(songs[1].totalPracticeSeconds).toBe(0); // defaults
  });

  test("updatePracticeTime calls updateDoc with increment", async () => {
    mockUpdateDoc.mockResolvedValue(undefined);

    await updatePracticeTime("song-1", 30);

    expect(mockUpdateDoc).toHaveBeenCalledTimes(1);
    expect(mockIncrement).toHaveBeenCalledWith(30);
  });

  test("updatePracticeTime skips when additionalSeconds <= 0", async () => {
    await updatePracticeTime("song-1", 0);
    expect(mockUpdateDoc).not.toHaveBeenCalled();

    await updatePracticeTime("song-1", -5);
    expect(mockUpdateDoc).not.toHaveBeenCalled();
  });

  test("deleteSong deletes subcollection files then song doc", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        { id: "f1" },
        { id: "f2" },
      ],
    });
    mockDeleteDoc.mockResolvedValue(undefined);

    await deleteSong("song-1");

    // 2 file deletes + 1 song delete
    expect(mockDeleteDoc).toHaveBeenCalledTimes(3);
  });
});

describe("File CRUD", () => {
  test("uploadFile uploads to storage and creates firestore record", async () => {
    mockUploadBytes.mockResolvedValue({});
    mockGetDownloadURL.mockResolvedValue("https://storage.example.com/file.png");
    mockGetDocs.mockResolvedValue({ size: 2 }); // existing file count
    mockAddDoc.mockResolvedValue({ id: "file-1" });

    const file = new File(["test"], "tab.png", { type: "image/png" });
    const result = await uploadFile("song-1", file);

    expect(mockUploadBytes).toHaveBeenCalledTimes(1);
    expect(mockGetDownloadURL).toHaveBeenCalledTimes(1);
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    expect(result.id).toBe("file-1");
    expect(result.name).toBe("tab.png");
    expect(result.type).toBe("image/png");
    expect(result.order).toBe(2); // appended at end
    expect(result.url).toBe("https://storage.example.com/file.png");
  });

  test("getFiles returns files sorted by order", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "f1",
          data: () => ({ name: "B.png", type: "image/png", size: 100, url: "url1", order: 1, createdAt: { toDate: () => new Date() } }),
        },
        {
          id: "f2",
          data: () => ({ name: "A.png", type: "image/png", size: 200, url: "url2", order: 0, createdAt: { toDate: () => new Date() } }),
        },
      ],
    });

    const files = await getFiles("song-1");

    expect(files).toHaveLength(2);
    expect(files[0].id).toBe("f2"); // order 0 first
    expect(files[1].id).toBe("f1"); // order 1 second
  });

  test("getFiles defaults order to 0 for legacy files", async () => {
    mockGetDocs.mockResolvedValue({
      docs: [
        {
          id: "f1",
          data: () => ({ name: "A.png", type: "image/png", size: 100, url: "url", createdAt: { toDate: () => new Date() } }),
        },
      ],
    });

    const files = await getFiles("song-1");
    expect(files[0].order).toBe(0);
  });

  test("updateFileOrder updates order for each file", async () => {
    mockUpdateDoc.mockResolvedValue(undefined);

    await updateFileOrder("song-1", ["f3", "f1", "f2"]);

    expect(mockUpdateDoc).toHaveBeenCalledTimes(3);
  });

  test("deleteFile deletes a file from the subcollection", async () => {
    mockDeleteDoc.mockResolvedValue(undefined);

    await deleteFile("song-1", "file-1");

    expect(mockDeleteDoc).toHaveBeenCalledTimes(1);
  });
});
