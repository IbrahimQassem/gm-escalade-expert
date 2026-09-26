import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { parseAnswer, DecisionCard, type Decision } from "@/components/decision";

// ─── parseAnswer (pure function) ─────────────────────────────────────────────

describe("parseAnswer", () => {
  it("returns raw text as body when no decision block present", () => {
    const result = parseAnswer("Just a plain answer.");
    expect(result.decision).toBeNull();
    expect(result.body).toBe("Just a plain answer.");
  });

  it("parses a complete decision block", () => {
    const raw = `Some intro text.
\`\`\`decision
status: VERIFIED
confidence: 92
sources: GM Service Manual 2010
conflicts: None
answer: Use ACDelco 18031339
\`\`\`
Trailing content.`;
    const { decision, body } = parseAnswer(raw);
    expect(decision).not.toBeNull();
    expect(decision!.status).toBe("VERIFIED");
    expect(decision!.confidence).toBe(92);
    expect(decision!.sources).toBe("GM Service Manual 2010");
    expect(decision!.conflicts).toBe("None");
    expect(decision!.answer).toBe("Use ACDelco 18031339");
    expect(body).toContain("Trailing content.");
    expect(body).not.toContain("```decision");
  });

  it("handles partial (unclosed) decision block during streaming", () => {
    const raw = "Thinking... ```decision\nstatus: HIGH CONFIDENCE\n";
    const { decision, body } = parseAnswer(raw);
    expect(decision).not.toBeNull();
    expect(decision!.status).toBe("HIGH CONFIDENCE");
    expect(body).toBe("");
  });

  it("sets confidence to null when not provided", () => {
    const raw = "```decision\nstatus: UNKNOWN\n```";
    const { decision } = parseAnswer(raw);
    expect(decision!.confidence).toBeNull();
  });

  it("strips non-numeric characters from confidence", () => {
    const raw = "```decision\nstatus: VERIFIED\nconfidence: ~85%\n```";
    const { decision } = parseAnswer(raw);
    expect(decision!.confidence).toBe(85);
  });

  it("defaults status to UNKNOWN when status field is missing", () => {
    const raw = "```decision\nconfidence: 70\n```";
    const { decision } = parseAnswer(raw);
    expect(decision!.status).toBe("UNKNOWN");
  });

  it("strips the decision block from body text", () => {
    const raw = "Before ```decision\nstatus: VERIFIED\n``` After";
    const { body } = parseAnswer(raw);
    expect(body).not.toContain("```decision");
  });
});

// ─── DecisionCard (component) ─────────────────────────────────────────────────

function makeDecision(overrides: Partial<Decision> = {}): Decision {
  return {
    status: "VERIFIED",
    confidence: 95,
    sources: "GM Manual",
    conflicts: "none",
    answer: "Replace hub bearing assembly",
    ...overrides,
  };
}

describe("DecisionCard", () => {
  it("renders the Arabic status label for VERIFIED", () => {
    render(<DecisionCard decision={makeDecision()} />);
    expect(screen.getByText("مُتحقق منه بالأدلة")).toBeInTheDocument();
  });

  it("renders the answer text", () => {
    render(<DecisionCard decision={makeDecision()} />);
    expect(screen.getByText("Replace hub bearing assembly")).toBeInTheDocument();
  });

  it("shows confidence percentage when provided", () => {
    render(<DecisionCard decision={makeDecision({ confidence: 90 })} />);
    expect(screen.getByText("الثقة 90%")).toBeInTheDocument();
  });

  it("does not show confidence when null", () => {
    render(<DecisionCard decision={makeDecision({ confidence: null })} />);
    expect(screen.queryByText(/الثقة/)).toBeNull();
  });

  it("shows conflict note when conflict is non-trivial", () => {
    render(<DecisionCard decision={makeDecision({ conflicts: "Source A disagrees with B" })} />);
    expect(screen.getByText(/تعارض في المصادر/)).toBeInTheDocument();
  });

  it("hides conflict note when conflict is 'none'", () => {
    render(<DecisionCard decision={makeDecision({ conflicts: "none" })} />);
    expect(screen.queryByText(/تعارض في المصادر/)).toBeNull();
  });

  it("uses UNKNOWN style for unrecognized status", () => {
    render(<DecisionCard decision={makeDecision({ status: "SOME_NEW_STATUS" })} />);
    expect(screen.getByText("غير معروف")).toBeInTheDocument();
  });

  it("renders the sources chip", () => {
    render(<DecisionCard decision={makeDecision({ sources: "Factory TSB" })} />);
    expect(screen.getByText("مصادر: Factory TSB")).toBeInTheDocument();
  });
});
