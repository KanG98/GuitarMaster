import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadZone } from "./UploadZone";

describe("UploadZone", () => {
  const defaultProps = {
    onFileSelected: jest.fn(),
    isUploading: false,
    error: null,
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders full upload zone by default", () => {
    render(<UploadZone {...defaultProps} />);
    expect(screen.getByText("Drag & drop your guitar tab here")).toBeInTheDocument();
    expect(screen.getByText("or click to browse files")).toBeInTheDocument();
  });

  test("renders compact mode with Add File button", () => {
    render(<UploadZone {...defaultProps} compact />);
    expect(screen.getByText("Add File")).toBeInTheDocument();
    expect(screen.queryByText("Drag & drop your guitar tab here")).not.toBeInTheDocument();
  });

  test("shows uploading state in full mode", () => {
    render(<UploadZone {...defaultProps} isUploading />);
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.getByText("Saving your file")).toBeInTheDocument();
  });

  test("shows uploading state in compact mode", () => {
    render(<UploadZone {...defaultProps} isUploading compact />);
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
  });

  test("displays error message", () => {
    render(<UploadZone {...defaultProps} error="Upload failed" />);
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });

  test("opens file picker on click", async () => {
    const user = userEvent.setup();
    render(<UploadZone {...defaultProps} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe(".png,.jpg,.jpeg,.webp,.gif,.pdf");
  });

  test("calls onFileSelected when a valid file is selected", async () => {
    const onFileSelected = jest.fn();
    render(<UploadZone {...defaultProps} onFileSelected={onFileSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "test.png", { type: "image/png" });

    await userEvent.upload(input, file);

    expect(onFileSelected).toHaveBeenCalledWith(file);
  });

  test("does not call onFileSelected for unsupported file types", async () => {
    const onFileSelected = jest.fn();
    render(<UploadZone {...defaultProps} onFileSelected={onFileSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "test.txt", { type: "text/plain" });

    await userEvent.upload(input, file);

    expect(onFileSelected).not.toHaveBeenCalled();
  });
});
