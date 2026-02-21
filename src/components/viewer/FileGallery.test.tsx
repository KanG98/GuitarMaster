import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileGallery } from "./FileGallery";
import { FileRecord } from "@/lib/fileService";

const mockFiles: FileRecord[] = [
  { id: "f1", name: "tab1.png", type: "image/png", size: 1024, url: "https://example.com/1.png", order: 0, createdAt: new Date() },
  { id: "f2", name: "tab2.pdf", type: "application/pdf", size: 2048, url: "https://example.com/2.pdf", order: 1, createdAt: new Date() },
  { id: "f3", name: "tab3.jpg", type: "image/jpeg", size: 512, url: "https://example.com/3.jpg", order: 2, createdAt: new Date() },
];

describe("FileGallery", () => {
  const defaultProps = {
    files: mockFiles,
    isLoading: false,
    onView: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders loading spinner when loading", () => {
    render(<FileGallery {...defaultProps} isLoading />);
    expect(screen.queryByText("tab1.png")).not.toBeInTheDocument();
  });

  test("renders nothing when files is empty", () => {
    const { container } = render(<FileGallery {...defaultProps} files={[]} />);
    expect(container.innerHTML).toBe("");
  });

  test("renders all file cards", () => {
    render(<FileGallery {...defaultProps} />);
    expect(screen.getByText("tab1.png")).toBeInTheDocument();
    expect(screen.getByText("tab2.pdf")).toBeInTheDocument();
    expect(screen.getByText("tab3.jpg")).toBeInTheDocument();
  });

  test("displays file sizes correctly", () => {
    render(<FileGallery {...defaultProps} />);
    expect(screen.getByText("1.0 KB")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();
    expect(screen.getByText("512 B")).toBeInTheDocument();
  });

  test("calls onView with file and index when image area clicked", async () => {
    const onView = jest.fn();
    render(<FileGallery {...defaultProps} onView={onView} />);

    const images = screen.getAllByRole("img");
    await userEvent.click(images[0]);

    expect(onView).toHaveBeenCalledWith(mockFiles[0], 0);
  });

  test("calls onDelete when delete button clicked", async () => {
    const onDelete = jest.fn();
    render(<FileGallery {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole("button");
    await userEvent.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith(mockFiles[0]);
  });

  test("shows grip handle when onReorder is provided", () => {
    render(<FileGallery {...defaultProps} onReorder={jest.fn()} />);
    // GripVertical icons should be rendered - cards should be draggable
    const cards = document.querySelectorAll("[draggable='true']");
    expect(cards.length).toBe(3);
  });

  test("cards are not draggable when onReorder is not provided", () => {
    render(<FileGallery {...defaultProps} />);
    const cards = document.querySelectorAll("[draggable='true']");
    expect(cards.length).toBe(0);
  });
});
