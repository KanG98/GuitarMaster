import { render, screen, fireEvent } from "@testing-library/react";
import { FileViewer } from "./FileViewer";
import { FileRecord } from "@/lib/fileService";

const mockFiles: FileRecord[] = [
  { id: "f1", name: "page1.png", type: "image/png", size: 1024, url: "https://example.com/1.png", order: 0, createdAt: new Date() },
  { id: "f2", name: "page2.png", type: "image/png", size: 2048, url: "https://example.com/2.png", order: 1, createdAt: new Date() },
  { id: "f3", name: "page3.png", type: "image/png", size: 3072, url: "https://example.com/3.png", order: 2, createdAt: new Date() },
  { id: "f4", name: "page4.pdf", type: "application/pdf", size: 4096, url: "https://example.com/4.pdf", order: 3, createdAt: new Date() },
  { id: "f5", name: "page5.png", type: "image/png", size: 5120, url: "https://example.com/5.png", order: 4, createdAt: new Date() },
];

describe("FileViewer - Dual Page", () => {
  const defaultProps = {
    files: mockFiles,
    currentIndex: 0,
    onNavigate: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders two images side by side", () => {
    render(<FileViewer {...defaultProps} />);
    expect(screen.getByAltText("page1.png")).toBeInTheDocument();
    expect(screen.getByAltText("page2.png")).toBeInTheDocument();
  });

  test("shows both file names separated by pipe", () => {
    render(<FileViewer {...defaultProps} />);
    expect(screen.getByText("page1.png | page2.png")).toBeInTheDocument();
  });

  test("shows counter as 1-2 / 5", () => {
    render(<FileViewer {...defaultProps} />);
    expect(screen.getByTestId("page-counter")).toHaveTextContent("1-2 / 5");
  });

  test("shows single page when on last odd file", () => {
    render(<FileViewer {...defaultProps} currentIndex={4} />);
    expect(screen.getByAltText("page5.png")).toBeInTheDocument();
    expect(screen.getByTestId("page-counter")).toHaveTextContent("5 / 5");
    // Only one image should be rendered
    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(1);
  });

  test("shows only the solo file name when last page is alone", () => {
    render(<FileViewer {...defaultProps} currentIndex={4} />);
    expect(screen.getByText("page5.png")).toBeInTheDocument();
  });

  test("right arrow navigates by 2", () => {
    const onNavigate = jest.fn();
    render(<FileViewer {...defaultProps} onNavigate={onNavigate} currentIndex={0} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(onNavigate).toHaveBeenCalledWith(2);
  });

  test("left arrow navigates back by 2", () => {
    const onNavigate = jest.fn();
    render(<FileViewer {...defaultProps} onNavigate={onNavigate} currentIndex={2} />);

    fireEvent.keyDown(window, { key: "ArrowLeft" });

    expect(onNavigate).toHaveBeenCalledWith(0);
  });

  test("left arrow does nothing on first page pair", () => {
    const onNavigate = jest.fn();
    render(<FileViewer {...defaultProps} onNavigate={onNavigate} currentIndex={0} />);

    fireEvent.keyDown(window, { key: "ArrowLeft" });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  test("right arrow does nothing on last page pair", () => {
    const onNavigate = jest.fn();
    render(<FileViewer {...defaultProps} onNavigate={onNavigate} currentIndex={4} />);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  test("Escape key calls onClose", () => {
    const onClose = jest.fn();
    render(<FileViewer {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("shows keyboard hint text", () => {
    render(<FileViewer {...defaultProps} />);
    expect(screen.getByText(/arrow keys to navigate/i)).toBeInTheDocument();
  });

  test("renders iframe for PDF files in dual view", () => {
    render(<FileViewer {...defaultProps} currentIndex={2} />);
    // page3.png (image) + page4.pdf (iframe)
    expect(screen.getByAltText("page3.png")).toBeInTheDocument();
    const iframe = document.querySelector("iframe");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", "https://example.com/4.pdf");
  });

  test("counter shows 3-4 / 5 on second page pair", () => {
    render(<FileViewer {...defaultProps} currentIndex={2} />);
    expect(screen.getByTestId("page-counter")).toHaveTextContent("3-4 / 5");
  });

  test("with 2 files, no next button exists", () => {
    const twoFiles = mockFiles.slice(0, 2);
    render(<FileViewer files={twoFiles} currentIndex={0} onNavigate={jest.fn()} onClose={jest.fn()} />);
    expect(screen.queryByLabelText("Next pages")).not.toBeInTheDocument();
  });

  test("with 2 files, no prev button on first pair", () => {
    const twoFiles = mockFiles.slice(0, 2);
    render(<FileViewer files={twoFiles} currentIndex={0} onNavigate={jest.fn()} onClose={jest.fn()} />);
    expect(screen.queryByLabelText("Previous pages")).not.toBeInTheDocument();
  });
});
