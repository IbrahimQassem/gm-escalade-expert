import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DtcInlineCards } from "@/components/chat-panel";

describe("DtcInlineCards", () => {
  it("renders null when text contains no DTC codes", () => {
    const { container } = render(<DtcInlineCards text="مرحبا، أريد استفسار عن الصيانة الدورية" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders inline card when text contains a valid DTC code", () => {
    render(<DtcInlineCards text="عندي مشكلة وكود الخطأ P0A80" />);
    
    expect(screen.getByTestId("dtc-inline-cards")).toBeInTheDocument();
    expect(screen.getByTestId("dtc-card-P0A80")).toBeInTheDocument();
    expect(screen.getByText("P0A80")).toBeInTheDocument();
    expect(screen.getByText("Hybrid Battery Pack")).toBeInTheDocument();
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("renders multiple cards when text contains multiple DTC codes", () => {
    render(<DtcInlineCards text="الفحص أظهر كود P0A80 وأيضاً كود P0C05" />);

    expect(screen.getByTestId("dtc-card-P0A80")).toBeInTheDocument();
    expect(screen.getByTestId("dtc-card-P0C05")).toBeInTheDocument();
  });

  it("renders potential causes when available", () => {
    render(<DtcInlineCards text="كود P0A80 ظهر فجأة" />);

    expect(screen.getByText(/الأسباب المحتملة:/i)).toBeInTheDocument();
  });

  it("renders correct badge styling for different severities", () => {
    render(<DtcInlineCards text="عندي P0171" />);

    const badge = screen.getByText("medium");
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain("text-yellow-400");
  });
});
