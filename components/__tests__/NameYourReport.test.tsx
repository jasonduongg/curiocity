import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import NewPromptModal from "@/components/newPrompt";
import "@testing-library/jest-dom";

describe("NameYourReport", () => {
  it("open modal button", () => {
    render(<NewPromptModal />);
    const openModalButton = screen.getByText("Open Modal");
    expect(openModalButton).toBeInTheDocument();
  });

  it("opens modal when open modal button is clicked", () => {
    render(<NewPromptModal />);
    const openModalButton = screen.getByText("Open Modal");
    fireEvent.click(openModalButton);

    expect(screen.getByText("Name your report.")).toBeInTheDocument();
    expect(
      screen.getByText("You can always change it later!"),
    ).toBeInTheDocument();
  });

  it("updates the report name in the input field", () => {
    render(<NewPromptModal />);
    fireEvent.click(screen.getByText("Open Modal"));

    const inputField = screen.getByPlaceholderText(
      "Enter report name",
    ) as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: "Test Report" } });
    expect(inputField.value).toBe("Test Report");
  });

  it("calls handleSave and closes modal on save button click", () => {
    render(<NewPromptModal />);
    fireEvent.click(screen.getByText("Open Modal"));

    const inputField = screen.getByPlaceholderText(
      "Enter report name",
    ) as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: "Test Report" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

    expect(screen.queryByText("Name your report.")).not.toBeInTheDocument();
  });

  it("clears input field on skip button click", () => {
    render(<NewPromptModal />);
    fireEvent.click(screen.getByText("Open Modal"));

    const inputField = screen.getByPlaceholderText(
      "Enter report name",
    ) as HTMLInputElement;
    fireEvent.change(inputField, { target: { value: "Test Report" } });

    const skipButton = screen.getByText("Skip");
    fireEvent.click(skipButton);

    expect(screen.queryByText("Name your report.")).not.toBeInTheDocument();
    expect(inputField.value).toBe("");
  });

  it("closes the modal when the overlay is clicked", () => {
    render(<NewPromptModal />);
    fireEvent.click(screen.getByText("Open Modal"));

    const overlay = screen.getByRole("button", { name: /close modal/i });
    fireEvent.click(overlay);

    expect(screen.queryByText("Name your report.")).not.toBeInTheDocument();
  });
});
