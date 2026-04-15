import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VitaSelect } from "@/components/VitaSelect";

describe("VitaSelect", () => {
  const stringOptions = [
    { label: "Pendiente", value: "pending" },
    { label: "Completada", value: "completed" },
    { label: "Rechazada", value: "rejected" },
  ];

  it("renders with placeholder text", () => {
    render(
      <VitaSelect
        options={stringOptions}
        placeholder="Select status"
      />,
    );
    expect(screen.getByText("Select status")).toBeInTheDocument();
  });

  it("calls onChange with the selected value", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <VitaSelect
        options={stringOptions}
        onChange={handleChange}
        placeholder="Select"
      />,
    );

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const option = await screen.findByText("Completada");
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith(
      "completed",
      expect.objectContaining({ value: "completed" }),
    );
  });

  it("renders all options in the dropdown", async () => {
    const user = userEvent.setup();

    render(
      <VitaSelect
        options={stringOptions}
        placeholder="Select"
      />,
    );

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    expect(await screen.findByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Completada")).toBeInTheDocument();
    expect(screen.getByText("Rechazada")).toBeInTheDocument();
  });

  it("supports numeric option values", async () => {
    const numericOptions = [
      { label: "One", value: 1 },
      { label: "Two", value: 2 },
    ];
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <VitaSelect<number>
        options={numericOptions}
        onChange={handleChange}
        placeholder="Pick"
      />,
    );

    const combobox = screen.getByRole("combobox");
    await user.click(combobox);

    const option = await screen.findByText("Two");
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ value: 2 }),
    );
  });
});
