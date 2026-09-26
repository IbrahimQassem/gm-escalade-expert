import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DtcLookupPanel } from "@/components/dtc-lookup";

describe("DtcLookupPanel", () => {
  it("renders all DTC codes initially", () => {
    render(<DtcLookupPanel />);

    expect(screen.getByText("فحص أكواد الأعطال (DTC)")).toBeInTheDocument();
    expect(screen.getByTestId("dtc-results-list")).toBeInTheDocument();

    // Verify key code cards are present
    expect(screen.getByTestId("dtc-card-P0A80")).toBeInTheDocument();
    expect(screen.getByTestId("dtc-card-P0C05")).toBeInTheDocument();
  });

  it("filters codes by typing into the search input", async () => {
    const user = userEvent.setup();
    render(<DtcLookupPanel />);

    const searchInput = screen.getByPlaceholderText(/ابحث بالرمز أو الوصف/i);
    await user.type(searchInput, "P0A80");

    expect(screen.getByTestId("dtc-card-P0A80")).toBeInTheDocument();
    expect(screen.queryByTestId("dtc-card-P0C05")).not.toBeInTheDocument();
  });

  it("filters codes by severity chip", async () => {
    const user = userEvent.setup();
    render(<DtcLookupPanel />);

    const criticalButton = screen.getByRole("button", { name: /حرج/i });
    await user.click(criticalButton);

    // Critical codes like P0A80 should appear, medium like P0A1A should not
    expect(screen.getByTestId("dtc-card-P0A80")).toBeInTheDocument();
    expect(screen.queryByTestId("dtc-card-P0A1A")).not.toBeInTheDocument();
  });

  it("displays empty state when no matching codes are found", async () => {
    const user = userEvent.setup();
    render(<DtcLookupPanel />);

    const searchInput = screen.getByPlaceholderText(/ابحث بالرمز أو الوصف/i);
    await user.type(searchInput, "P9999");

    expect(screen.getByText(/لم يتم العثور على أكواد مطابقة/i)).toBeInTheDocument();
  });

  it("clicking a quick-chip filters by that code", async () => {
    const user = userEvent.setup();
    render(<DtcLookupPanel />);

    const chip = screen.getByRole("button", { name: "P0C05" });
    await user.click(chip);

    expect(screen.getByTestId("dtc-card-P0C05")).toBeInTheDocument();
    expect(screen.queryByTestId("dtc-card-P0A80")).not.toBeInTheDocument();
  });

  it("triggers onSelectCode when clicking ask assistant button", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    render(<DtcLookupPanel onSelectCode={handleSelect} />);

    const askButtons = screen.getAllByRole("button", { name: /اسأل المساعد/i });
    expect(askButtons.length).toBeGreaterThan(0);
    await user.click(askButtons[0]!);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(expect.any(String));
  });
});
