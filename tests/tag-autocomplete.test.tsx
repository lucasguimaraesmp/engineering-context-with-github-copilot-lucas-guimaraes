import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TagAutocomplete } from "@/components/upload/TagAutocomplete";

const availableTags = ["portrait", "wedding", "wildlife"];

function ControlledAutocomplete() {
  const [value, setValue] = useState("");

  return (
    <TagAutocomplete
      availableTags={availableTags}
      label="Tags"
      onChange={setValue}
      value={value}
    />
  );
}

describe("TagAutocomplete", () => {
  it("preserves previous tags when selecting a case-insensitive suggestion", async () => {
    const user = userEvent.setup();
    render(<ControlledAutocomplete />);

    const input = screen.getByRole("combobox", { name: "Tags" });
    await user.type(input, "portrait, WI");

    const suggestion = screen.getByRole("option", { name: "wildlife" });
    expect(suggestion).toBeVisible();
    await user.click(suggestion);

    expect(input).toHaveValue("portrait, wildlife");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the suggestions when the current token has no matches", async () => {
    const user = userEvent.setup();
    render(<ControlledAutocomplete />);

    const input = screen.getByRole("combobox", { name: "Tags" });
    await user.type(input, "w");
    expect(screen.getAllByRole("option")).not.toHaveLength(0);

    await user.type(input, "zzz");

    expect(input).toHaveValue("wzzz");
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});