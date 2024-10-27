import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteConfirmationModal from "../DeleteConfirmationModal";

describe("DeleteConfirmationModal", () => {
  it("renders the delete button", () => {
    render(<DeleteConfirmationModal />);
    const deleteButton = screen.getByText("Delete File");
    expect(deleteButton).toBeInTheDocument();
  });

  it("opens the modal when delete button is clicked", () => {
    render(<DeleteConfirmationModal />);

    const deleteButton = screen.getByText("Delete File");
    fireEvent.click(deleteButton);

    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Are you sure you want to delete this file? This action cannot be undone.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("closes the modal one cancel button click", () => {
    render(<DeleteConfirmationModal />);

    const deleteButton = screen.getByText("Delete File");
    fireEvent.click(deleteButton);

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("closes modal on delete click", () => {
    const consoleSpy = jest.spyOn(console, "log");

    render(<DeleteConfirmationModal />);

    const deleteButton = screen.getByText("Delete File");
    fireEvent.click(deleteButton);

    const confirmDeleteButton = screen.getByText("Delete");
    fireEvent.click(confirmDeleteButton);

    expect(consoleSpy).toHaveBeenCalledWith("File deleted");

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
