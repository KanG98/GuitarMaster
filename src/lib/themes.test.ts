import { loadSavedTheme, saveTheme, applyTheme, THEMES, STORAGE_KEY, type ThemeColors } from "./themes";

describe("themes", () => {
  let localStorageGetSpy: jest.SpyInstance;
  let localStorageSetSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorageGetSpy = jest.spyOn(Storage.prototype, "getItem");
    localStorageSetSpy = jest.spyOn(Storage.prototype, "setItem");

    // Clean up any leftover style element
    document.getElementById("gm-theme")?.remove();

    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorageGetSpy.mockRestore();
    localStorageSetSpy.mockRestore();
    document.getElementById("gm-theme")?.remove();
  });

  describe("loadSavedTheme", () => {
    it("returns first theme when window is undefined (SSR)", () => {
      const originalWindow = global.window;
      delete (global as unknown as Record<string, unknown>).window;

      const result = loadSavedTheme();
      expect(result).toEqual(THEMES[0]);

      global.window = originalWindow;
    });

    it("returns first theme when localStorage is empty", () => {
      localStorageGetSpy.mockReturnValue(null);
      const result = loadSavedTheme();
      expect(localStorageGetSpy).toHaveBeenCalledWith(STORAGE_KEY);
      expect(result).toEqual(THEMES[0]);
    });

    it("returns saved theme when it exists", () => {
      localStorageGetSpy.mockReturnValue("blue");
      const result = loadSavedTheme();
      expect(result).toEqual(THEMES.find(t => t.id === "blue"));
    });

    it("returns first theme when saved theme ID is not found", () => {
      localStorageGetSpy.mockReturnValue("nonexistent");
      const result = loadSavedTheme();
      expect(result).toEqual(THEMES[0]);
    });
  });

  describe("saveTheme", () => {
    it("saves theme to localStorage and applies it", () => {
      const blueTheme = THEMES.find(t => t.id === "blue")!;
      saveTheme(blueTheme);

      expect(localStorageSetSpy).toHaveBeenCalledWith(STORAGE_KEY, "blue");
      const styleEl = document.getElementById("gm-theme");
      expect(styleEl).toBeTruthy();
      expect(styleEl!.textContent).toContain(blueTheme.primary);
    });
  });

  describe("applyTheme", () => {
    it("creates a style tag with CSS custom properties", () => {
      const testTheme: ThemeColors = {
        id: "test",
        name: "Test",
        emoji: "🧪",
        primary: "oklch(0.5 0.1 180)",
        primaryForeground: "oklch(1 0 0)",
        ring: "oklch(0.6 0.1 180)",
      };

      applyTheme(testTheme);

      const styleEl = document.getElementById("gm-theme");
      expect(styleEl).toBeTruthy();
      expect(styleEl!.textContent).toContain("--primary:oklch(0.5 0.1 180)");
      expect(styleEl!.textContent).toContain("--primary-foreground:oklch(1 0 0)");
      expect(styleEl!.textContent).toContain("--ring:oklch(0.6 0.1 180)");
    });

    it("removes style tag when applying default theme", () => {
      // First apply a non-default theme
      applyTheme(THEMES[1]);
      expect(document.getElementById("gm-theme")).toBeTruthy();

      // Then apply default
      applyTheme(THEMES[0]);
      expect(document.getElementById("gm-theme")).toBeNull();
    });

    it("reuses existing style tag", () => {
      applyTheme(THEMES[1]);
      applyTheme(THEMES[2]);

      const styleTags = document.querySelectorAll("#gm-theme");
      expect(styleTags).toHaveLength(1);
      expect(styleTags[0].textContent).toContain(THEMES[2].primary);
    });
  });

  describe("THEMES", () => {
    it("should have correct structure", () => {
      expect(THEMES).toHaveLength(8);
      expect(THEMES[0].id).toBe("default");
      expect(THEMES[0].name).toBe("Charcoal");
    });

    it("should have unique IDs", () => {
      const ids = THEMES.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
