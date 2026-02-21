import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddSongDialog } from "./AddSongDialog";

describe("AddSongDialog", () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onSubmit: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => jest.clearAllMocks());

  test("renders dialog with title and fields when open", () => {
    render(<AddSongDialog {...defaultProps} />);
    expect(screen.getByText("Add New Song")).toBeInTheDocument();
    expect(screen.getByLabelText("Song Name *")).toBeInTheDocument();
    expect(screen.getByLabelText("Artist")).toBeInTheDocument();
  });

  test("Create button is disabled when name is empty", () => {
    render(<AddSongDialog {...defaultProps} />);
    const createButton = screen.getByRole("button", { name: "Create" });
    expect(createButton).toBeDisabled();
  });

  test("Create button is enabled when name is filled", async () => {
    const user = userEvent.setup();
    render(<AddSongDialog {...defaultProps} />);

    await user.type(screen.getByLabelText("Song Name *"), "My Song");

    const createButton = screen.getByRole("button", { name: "Create" });
    expect(createButton).toBeEnabled();
  });

  test("calls onSubmit with name and artist on form submit", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AddSongDialog {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Song Name *"), "Hotel California");
    await user.type(screen.getByLabelText("Artist"), "Eagles");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onSubmit).toHaveBeenCalledWith("Hotel California", "Eagles");
  });

  test("trims whitespace from inputs", async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AddSongDialog {...defaultProps} onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Song Name *"), "  My Song  ");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onSubmit).toHaveBeenCalledWith("My Song", "");
  });

  test("does not render content when closed", () => {
    render(<AddSongDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Add New Song")).not.toBeInTheDocument();
  });
});
