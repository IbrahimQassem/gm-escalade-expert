import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type Decision = {
  status: string;
  confidence: number | null;
  sources: string;
  conflicts: string;
  answer: string;
};

const DECISION_RE = /```decision\s*([\s\S]*?)```/i;

export function parseAnswer(raw: string): { decision: Decision | null; body: string } {
  const match = raw.match(DECISION_RE);
  if (!match) {
    // stream may still be inside an unclosed decision block
    const open = raw.indexOf("```decision");
    if (open !== -1) {
      const partial = raw.slice(open + 11);
      return { decision: parseFields(partial), body: "" };
    }
    return { decision: null, body: raw };
  }
  return {
    decision: parseFields(match[1] ?? ""),
    body: raw.replace(DECISION_RE, "").trim(),
  };
}

function parseFields(block: string): Decision {
  const get = (name: string) => {
    const m = block.match(new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, "mi"));
    return m?.[1]?.trim() ?? "";
  };
  const conf = get("confidence").replace(/[^0-9]/g, "");
  return {
    status: get("status") || "UNKNOWN",
    confidence: conf ? Number(conf) : null,
    sources: get("sources"),
    conflicts: get("conflicts"),
    answer: get("answer"),
  };
}

const STATUS_STYLES: Record<string, { cls: string; ar: string }> = {
  VERIFIED: { cls: "status-verified", ar: "مُتحقق منه بالأدلة" },
  "HIGH CONFIDENCE": { cls: "status-high", ar: "ثقة عالية" },
  "NEEDS VIN/OPTION CHECK": { cls: "status-check", ar: "يحتاج تأكيد VIN/خيارات" },
  "UNVERIFIED/DO NOT BUY": { cls: "status-danger", ar: "غير مُتحقق — لا تشترِ" },
  UNKNOWN: { cls: "status-unknown", ar: "غير معروف" },
};

export function DecisionCard({ decision }: { decision: Decision }) {
  const key = decision.status.toUpperCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES["UNKNOWN"]!;
  const hasConflict = decision.conflicts && !/^none$|^لا/i.test(decision.conflicts.trim());

  return (
    <div className="decision-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`status-chip ${style.cls}`}>{style.ar}</span>
        <span className="chip-mono">{key}</span>
        {decision.confidence !== null && (
          <span className="chip-mono">الثقة {decision.confidence}%</span>
        )}
        {decision.sources && <span className="chip-mono">مصادر: {decision.sources}</span>}
      </div>
      {decision.answer && (
        <p className="mt-3 text-base font-semibold leading-7 text-foreground">{decision.answer}</p>
      )}
      {decision.confidence !== null && (
        <div className="confidence-track">
          <div className="confidence-fill" style={{ width: `${decision.confidence}%` }} />
        </div>
      )}
      {hasConflict ? (
        <p className="conflict-note">تعارض في المصادر: {decision.conflicts}</p>
      ) : null}
    </div>
  );
}

export function AnswerBody({ text }: { text: string }) {
  return (
    <div className="prose-rtl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
