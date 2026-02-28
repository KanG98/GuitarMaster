import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemePicker } from "./ThemePicker";
import * as themesModule from "@/lib/themes";

// Mock the themes module
jest.mock("@/lib/themes", () => {
  const originalModule = jest.requireActual("@/lib/themes");
  return {
    ...originalModule,
    loadSavedTheme: jest.fn(),
    saveTheme: jest.fn(),
  };
});

const mockLoadSavedTheme = themesModule.loadSavedTheme as jest.MockedFunction<typeof themesModule.loadSavedTheme>;
const mockSaveTheme = themesModule.saveTheme as jest.MockedFunction<typeof themesModule.saveTheme>;

describe("ThemePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default to return the first theme
    mockLoadSavedTheme.mockReturnValue(themesModule.THEMES[0]);
  });

  test("renders theme picker button", () => {
    render(<ThemePicker />);
    
    const button = screen.getByTestId("theme-picker-button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Change Theme");
  });

  test("opens dropdown when button is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemePicker />);
    
    const button = screen.getByTestId("theme-picker-button");
    await user.click(button);
    
    expect(screen.getByTestId("theme-picker-dropdown")).toBeInTheDocument();
  });

  test("closes dropdown when clicked outside", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <ThemePicker />
        <div data-testid="outside">Outside</div>
      </div>
    );
    
    // Open dropdown
    const button = screen.getByTestId("theme-picker-button");
    await user.click(button);
    expect(screen.getByTestId("theme-picker-dropdown")).toBeInTheDocument();
    
    // Click outside
    const outside = screen.getByTestId("outside");
    await user.click(outside);
    
    await waitFor(() => {
      expect(screen.queryByTestId("theme-picker-dropdown")).not.toBeInTheDocument();
    });
  });

  test("displays all theme options", async () => {
    const user = userEvent.setup();
    render(<ThemePicker />);
    
    const button = screen.getByTestId("theme-picker-button");
    await user.click(button);
    
    // Check that all themes are displayed
    themesModule.THEMES.forEach(theme => {
      expect(screen.getByTestId(`theme-option-${theme.id}`)).toBeInTheDocument();
      expect(screen.getByText(theme.name)).toBeInTheDocument();
      expect(screen.getByText(theme.emoji)).toBeInTheDocument();
    });
  });

  test("shows check mark for current theme", async () => {
    const user = userEvent.setup();
    // Mock loading the blue theme
    const blueTheme = themesModule.THEMES.find(t => t.id === "blue")!;
    mockLoadSavedTheme.mockReturnValue(blueTheme);
    
    render(<ThemePicker />);
    
    const button = screen.getByTestId("theme-picker-button");
    await user.click(button);
    
    // Should have a check mark in the blue theme option
    const blueOption = screen.getByTestId("theme-option-blue");
    expect(blueOption.querySelector("svg")).toBeInTheDocument(); // Check mark icon
  });

  test("selects theme when option is clicked", async () => {
    const user = userEvent.setup();
    render(<ThemePicker />);
    
    const button = screen.getByTestId("theme-picker-button");
    await user.click(button);
    
    // Click on blue theme
    const blueOption = screen.getByTestId("theme-option-blue");
    await user.click(blueOption);
    
    // Should call saveTheme with blue theme
    const blueTheme = themesModule.THEMES.find(t => t.id === "blue")!;
    expect(mockSaveTheme).toHaveBeenCalledWith(blueTheme);
    
    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByTestId("theme-picker-dropdown")).not.toBeInTheDocument();
    });
  });

  test("loads saved theme on mount", () => {
    const pinkTheme = themesModule.THEMES.find(t => t.id === "pink")!;
    mockLoadSavedTheme.mockReturnValue(pinkTheme);
    
    render(<ThemePicker />);
    
    expect(mockLoadSavedTheme).toHaveBeenCalledTimes(1);
  });
});