import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./useIsMobile";

// Mock window.innerWidth
Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: 1024,
});

describe("useIsMobile", () => {
  beforeEach(() => {
    // Reset window width before each test
    window.innerWidth = 1024;
  });

  it("should return false when screen is wider than breakpoint", () => {
    window.innerWidth = 800;
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it("should return true when screen is narrower than breakpoint", () => {
    window.innerWidth = 500;
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it("should use custom breakpoint", () => {
    window.innerWidth = 900;
    const { result } = renderHook(() => useIsMobile(1000));
    
    expect(result.current).toBe(true);
  });

  it("should respond to window resize events", () => {
    const { result } = renderHook(() => useIsMobile());
    
    // Initially wide screen
    expect(result.current).toBe(false);
    
    // Resize to mobile
    act(() => {
      window.innerWidth = 500;
      window.dispatchEvent(new Event("resize"));
    });
    
    expect(result.current).toBe(true);
    
    // Resize back to desktop
    act(() => {
      window.innerWidth = 1200;
      window.dispatchEvent(new Event("resize"));
    });
    
    expect(result.current).toBe(false);
  });

  it("should clean up resize event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() => useIsMobile());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});