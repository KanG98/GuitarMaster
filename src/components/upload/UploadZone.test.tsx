import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UploadZone } from "./UploadZone";

describe("UploadZone", () => {
  const defaultProps = {
    onFilesSelected: jest.fn(),
    isUploading: false,
    error: null,
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders full upload zone by default", () => {
    render(<UploadZone {...defaultProps} />);
    expect(screen.getByText("Drag & drop your guitar tabs here")).toBeInTheDocument();
    expect(screen.getByText("or click to browse files")).toBeInTheDocument();
  });

  test("renders compact mode with Add Files button", () => {
    render(<UploadZone {...defaultProps} compact />);
    expect(screen.getByText("Add Files")).toBeInTheDocument();
    expect(screen.queryByText("Drag & drop your guitar tabs here")).not.toBeInTheDocument();
  });

  test("shows uploading state in full mode", () => {
    render(<UploadZone {...defaultProps} isUploading />);
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
    expect(screen.getByText("Saving your files")).toBeInTheDocument();
  });

  test("shows upload progress in full mode", () => {
    render(<UploadZone {...defaultProps} isUploading uploadProgress="Uploading 2 / 5..." />);
    expect(screen.getByText("Uploading 2 / 5...")).toBeInTheDocument();
  });

  test("shows uploading state in compact mode", () => {
    render(<UploadZone {...defaultProps} isUploading compact />);
    expect(screen.getByText("Uploading...")).toBeInTheDocument();
  });

  test("displays error message", () => {
    render(<UploadZone {...defaultProps} error="Upload failed" />);
    expect(screen.getByText("Upload failed")).toBeInTheDocument();
  });

  test("file input accepts correct types and allows multiple", () => {
    render(<UploadZone {...defaultProps} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe(".png,.jpg,.jpeg,.webp,.gif,.pdf");
    expect(input.multiple).toBe(true);
  });

  test("calls onFilesSelected with valid files", async () => {
    const onFilesSelected = jest.fn();
    render(<UploadZone {...defaultProps} onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "test.png", { type: "image/png" });

    await userEvent.upload(input, file);

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });

  test("supports multiple file upload", async () => {
    const onFilesSelected = jest.fn();
    render(<UploadZone {...defaultProps} onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file1 = new File(["content1"], "test1.png", { type: "image/png" });
    const file2 = new File(["content2"], "test2.jpg", { type: "image/jpeg" });

    await userEvent.upload(input, [file1, file2]);

    expect(onFilesSelected).toHaveBeenCalledWith([file1, file2]);
  });

  test("filters out unsupported file types from batch", async () => {
    const onFilesSelected = jest.fn();
    render(<UploadZone {...defaultProps} onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(["content"], "test.png", { type: "image/png" });
    const invalidFile = new File(["content"], "test.txt", { type: "text/plain" });

    await userEvent.upload(input, [validFile, invalidFile]);

    expect(onFilesSelected).toHaveBeenCalledWith([validFile]);
  });

  test("does not call onFilesSelected when all files are unsupported", async () => {
    const onFilesSelected = jest.fn();
    render(<UploadZone {...defaultProps} onFilesSelected={onFilesSelected} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["content"], "test.txt", { type: "text/plain" });

    await userEvent.upload(input, file);

    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});
