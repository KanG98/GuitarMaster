import "@testing-library/jest-dom";

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock scrollIntoView (not available in JSDOM)
Element.prototype.scrollIntoView = jest.fn();
