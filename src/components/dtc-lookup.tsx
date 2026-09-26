import { AlertTriangle, MessageSquare, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { DTC_CODES, searchDtcCodes, type DtcCode, type DtcSeverity } from "@/lib/dtc-codes";

export interface DtcLookupPanelProps {
  onSelectCode?: (code: string) => void;
}

const SEVERITY_CONFIG: Record<
  DtcSeverity,
  { label: string; badge: string; border: string }
> = {
  critical: {
    label: "حرج",
    badge: "bg-red-500/15 text-red-400 border border-red-500/30",
    border: "border-r-4 border-red-500",
  },
  high: {
    label: "عالي",
    badge: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    border: "border-r-4 border-orange-500",
  },
  medium: {
    label: "متوسط",
    badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    border: "border-r-4 border-yellow-500",
  },
  low: {
    label: "منخفض",
    badge: "bg-green-500/15 text-green-400 border border-green-500/30",
    border: "border-r-4 border-green-500",
  },
};

const POPULAR_CODES = ["P0A80", "P0AC4", "P0C05", "P0A7F", "P0A1A", "P0171"];

export function DtcLookupPanel({ onSelectCode }: DtcLookupPanelProps) {
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<DtcSeverity | "all">("all");

  const filteredCodes = useMemo(() => {
    let list: DtcCode[] = query.trim() ? searchDtcCodes(query.trim()) : DTC_CODES;

    if (severityFilter !== "all") {
      list = list.filter((c) => c.severity === severityFilter);
    }

    return list;
  }, [query, severityFilter]);

  return (
    <section className="space-y-4 text-start">
      <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          فحص أكواد الأعطال (DTC)
        </h2>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          دليل التشخيص السريع لأكواد نظام 2-Mode Hybrid وبطارية الجهد العالي (300V) لكاديلاك إسكاليد 2010.
        </p>

        {/* Search input */}
        <div className="relative mt-4">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالرمز أو الوصف (مثال: P0A80 أو Battery)..."
            className="w-full rounded-lg border border-input bg-background/80 py-2.5 pe-4 ps-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="مسح البحث"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Quick chip filters */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium">أكواد شائعة:</span>
          {POPULAR_CODES.map((code) => (
            <button
              key={code}
              onClick={() => setQuery(code)}
              className={`rounded-md px-2 py-0.5 font-mono text-xs transition-colors ${
                query.toUpperCase() === code
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted/80 text-foreground/80 hover:bg-muted"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Severity filter tabs */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
          <span className="text-xs font-medium text-muted-foreground">مستوى الخطورة:</span>
          <button
            onClick={() => setSeverityFilter("all")}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              severityFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/60 text-muted-foreground hover:bg-muted"
            }`}
          >
            الكل ({DTC_CODES.length})
          </button>
          {(["critical", "high", "medium", "low"] as DtcSeverity[]).map((sev) => {
            const count = DTC_CODES.filter((c) => c.severity === sev).length;
            const cfg = SEVERITY_CONFIG[sev];
            return (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  severityFilter === sev
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results header count */}
      <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          عرض {filteredCodes.length} من أصل {DTC_CODES.length} كود مسجل
        </span>
      </div>

      {/* Results list */}
      <div data-testid="dtc-results-list" className="space-y-3">
        {filteredCodes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-8 text-center">
            <AlertTriangle className="mx-auto size-8 text-muted-foreground/60" />
            <p className="mt-2 text-sm font-medium text-foreground">
              لم يتم العثور على أكواد مطابقة
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              جرب البحث برمز آخر أو تنظيف معايير الفلترة.
            </p>
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setSeverityFilter("all");
                }}
                className="mt-3 inline-flex items-center rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80"
              >
                إعادة ضبط البحث
              </button>
            )}
          </div>
        ) : (
          filteredCodes.map((dtc) => {
            const cfg = SEVERITY_CONFIG[dtc.severity];
            return (
              <div
                key={dtc.code}
                data-testid={`dtc-card-${dtc.code}`}
                className={`rounded-xl border border-border/80 bg-card p-4 transition-shadow hover:shadow-md ${cfg.border}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm font-bold tracking-wider text-foreground sm:text-base">
                      {dtc.code}
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase ${cfg.badge}`}
                    >
                      {cfg.label} ({dtc.severity})
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {dtc.system}
                    </span>
                  </div>

                  {onSelectCode && (
                    <button
                      onClick={() => onSelectCode(dtc.code)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <MessageSquare className="size-3.5" />
                      اسأل المساعد عن هذا الكود
                    </button>
                  )}
                </div>

                <p className="mt-2 text-sm leading-relaxed text-foreground/90 font-medium">
                  {dtc.description}
                </p>

                {dtc.causes && dtc.causes.length > 0 && (
                  <div className="mt-2.5 border-t border-border/50 pt-2 text-xs">
                    <span className="font-semibold text-muted-foreground">الأسباب المحتملة:</span>
                    <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                      {dtc.causes.map((cause, i) => (
                        <li key={i} className="text-foreground/80">
                          {cause}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
