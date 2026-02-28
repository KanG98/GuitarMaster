import { loadSavedTheme, saveTheme, applyTheme, THEMES, STORAGE_KEY, type ThemeColors } from "./themes";

describe("themes", () => {
  let localStorageGetSpy: jest.SpyInstance;
  let localStorageSetSpy: jest.SpyInstance;
  let documentSetPropertySpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock localStorage
    localStorageGetSpy = jest.spyOn(Storage.prototype, 'getItem');
    localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    // Create a mock element with style.setProperty
    const mockElement = {
      style: {
        setProperty: jest.fn()
      }
    };
    
    // Mock document.documentElement
    documentSetPropertySpy = mockElement.style.setProperty;
    Object.defineProperty(document, 'documentElement', {
      value: mockElement,
      configurable: true
    });
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorageGetSpy.mockRestore();
    localStorageSetSpy.mockRestore();
  });

  describe("loadSavedTheme", () => {
    it("returns first theme when window is undefined (SSR)", () => {
      const originalWindow = global.window;
      delete (global as any).window;
      
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
      
      expect(localStorageGetSpy).toHaveBeenCalledWith(STORAGE_KEY);
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
      expect(documentSetPropertySpy).toHaveBeenCalledWith("--primary", blueTheme.primary);
      expect(documentSetPropertySpy).toHaveBeenCalledWith("--primary-foreground", blueTheme.primaryForeground);
      expect(documentSetPropertySpy).toHaveBeenCalledWith("--ring", blueTheme.ring);
    });
  });

  describe("applyTheme", () => {
    it("sets CSS custom properties on document root", () => {
      const testTheme: ThemeColors = {
        id: "test",
        name: "Test Theme",
        emoji: "🧪",
        primary: "oklch(0.5 0.1 180)",
        primaryForeground: "oklch(1 0 0)",
        ring: "oklch(0.6 0.1 180)"
      };
      
      applyTheme(testTheme);
      
      expect(documentSetPropertySpy).toHaveBeenCalledWith("--primary", "oklch(0.5 0.1 180)");
      expect(documentSetPropertySpy).toHaveBeenCalledWith("--primary-foreground", "oklch(1 0 0)");
      expect(documentSetPropertySpy).toHaveBeenCalledWith("--ring", "oklch(0.6 0.1 180)");
      expect(documentSetPropertySpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("THEMES", () => {
    it("should have correct structure", () => {
      expect(THEMES).toHaveLength(8);
      expect(THEMES[0].id).toBe("default");
      expect(THEMES[0].name).toBe("Charcoal");
      expect(THEMES[0].emoji).toBe("🎸");
    });

    it("should have unique IDs", () => {
      const ids = THEMES.map(t => t.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds).toHaveLength(ids.length);
    });
  });
});