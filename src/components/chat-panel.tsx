import { BookmarkPlus, Globe, Loader2, Search, SendHorizonal, Trash2, AlertTriangle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { AnswerBody, DecisionCard, parseAnswer } from "@/components/decision";
import { newId, useConversation, useSavedFacts, useSources, type ChatMessage } from "@/lib/store";
import { extractDtcCodesFromText, type DtcCode } from "@/lib/dtc-codes";
import type { Section } from "@/lib/vehicle";

export function ChatPanel({ section }: { section: Section }) {
  const [messages, setMessages] = useConversation(section.id);
  const [, setSources] = useSources();
  const [facts, setFacts] = useSavedFacts();
  const [input, setInput] = useState("");
  const [deep, setDeep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [liveSearches, setLiveSearches] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [section.id, busy]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, liveSearches]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;
      setInput("");
      setBusy(true);
      setLiveSearches([]);

      const userMsg: ChatMessage = {
        id: newId(),
        role: "user",
        content: question,
        createdAt: Date.now(),
      };
      const assistantId = newId();
      const history = [...messages, userMsg];
      setMessages([
        ...history,
        { id: assistantId, role: "assistant", content: "", deep, createdAt: Date.now() },
      ]);

      const searches: string[] = [];
      const collected: { url: string; title: string }[] = [];
      let acc = "";

      const patch = (fields: Partial<ChatMessage>) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...fields } : m)));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            sectionFocus: section.focus,
            deep,
            savedFacts: JSON.stringify(
              facts.map((fact) => ({
                topic: fact.topic,
                content: fact.content,
                status: fact.status,
              })),
            ),
          }),
        });
        if (!res.ok || !res.body) throw new Error(String(res.status));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let evt: { type: string; [k: string]: unknown };
            try {
              evt = JSON.parse(line);
            } catch {
              continue;
            }
            if (evt.type === "delta") {
              acc += String(evt["text"] ?? "");
              patch({ content: acc });
            } else if (evt.type === "search") {
              const qs = (evt["queries"] as string[]) ?? [];
              for (const q of qs) if (q && !searches.includes(q)) searches.push(q);
              setLiveSearches([...searches]);
              patch({ searches: [...searches] });
            } else if (evt.type === "source") {
              const src = { url: String(evt["url"]), title: String(evt["title"]) };
              if (!collected.some((s) => s.url === src.url)) collected.push(src);
              patch({ sources: [...collected] });
            } else if (evt.type === "error") {
              acc += `\n\n**${String(evt["message"] ?? "خطأ غير متوقع")}**`;
              patch({ content: acc });
            }
          }
        }

        if (collected.length) {
          setSources((prev) => {
            const map = new Map(prev.map((s) => [s.url, s]));
            for (const s of collected)
              if (!map.has(s.url))
                map.set(s.url, { ...s, addedAt: Date.now(), topic: question.slice(0, 80) });
            return [...map.values()].sort((a, b) => b.addedAt - a.addedAt);
          });
        }
        if (!acc.trim()) patch({ content: "لم يصل رد من المحرك. حاول مرة أخرى." });
      } catch {
        patch({ content: "تعذّر الاتصال بالخادم. تحقق من الاتصال وحاول مجدداً." });
      } finally {
        setBusy(false);
        setLiveSearches([]);
      }
    },
    [busy, deep, facts, messages, section.focus, setMessages, setSources],
  );

  const saveFact = (msg: ChatMessage) => {
    const { decision, body } = parseAnswer(msg.content);
    setFacts((prev) => [
      {
        id: newId(),
        topic: decision?.answer || body.slice(0, 80) || "معلومة محفوظة",
        content: msg.content,
        status: decision?.status ?? "UNKNOWN",
        sources: msg.sources ?? [],
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-1 pb-4">
        {messages.length === 0 && (
          <div className="empty-state">
            <p className="text-sm text-muted-foreground">{section.hint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(section.suggestions ?? []).map((s) => (
                <button key={s} className="suggestion" onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id}>
              <DtcInlineCards text={msg.content} />
              <div className="flex justify-start">
                <div className="user-bubble">{msg.content}</div>
              </div>
            </div>
          ) : (
            <AssistantMessage key={msg.id} msg={msg} onSave={() => saveFact(msg)} busy={busy} />
          ),
        )}

        {busy && liveSearches.length > 0 && (
          <div className="research-strip">
            <Globe className="size-4 animate-pulse text-accent" />
            <span className="text-xs text-muted-foreground">جارٍ البحث والتحقق من المصادر:</span>
            <span className="truncate font-mono text-xs text-foreground">
              {liveSearches[liveSearches.length - 1]}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          rows={2}
          placeholder="اكتب سؤالك عن السيارة…"
          className="composer-input"
        />
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDeep((d) => !d)}
            className={`mode-toggle ${deep ? "mode-toggle-on" : ""}`}
          >
            <Search className="size-4" />
            بحث عميق
          </button>
          {messages.length > 0 && (
            <button type="button" className="icon-btn" onClick={() => setMessages([])}>
              <Trash2 className="size-4" />
            </button>
          )}
          <button type="submit" disabled={busy || !input.trim()} className="send-btn ms-auto">
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <SendHorizonal className="size-4 rtl:-scale-x-100" />
            )}
            إرسال
          </button>
        </div>
      </form>
    </div>
  );
}

function AssistantMessage({
  msg,
  onSave,
  busy,
}: {
  msg: ChatMessage;
  onSave: () => void;
  busy: boolean;
}) {
  const { decision, body } = parseAnswer(msg.content);
  const streaming = busy && !msg.content;

  return (
    <div className="assistant-msg">
      {streaming && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-accent" />
          يفكّر ويتحقق من الأدلة…
        </div>
      )}
      {msg.deep && <span className="chip-mono mb-2 inline-block">وضع البحث العميق</span>}
      {decision && <DecisionCard decision={decision} />}
      {body && <AnswerBody text={body} />}
      {msg.sources && msg.sources.length > 0 && (
        <div className="source-list">
          <p className="text-xs font-semibold text-muted-foreground">المصادر</p>
          <ol className="mt-1 space-y-1">
            {msg.sources.map((s, i) => (
              <li key={s.url} className="text-xs">
                <a href={s.url} target="_blank" rel="noreferrer" className="source-link">
                  {i + 1}. {s.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
      {msg.content && !busy && (
        <button className="save-btn" onClick={onSave}>
          <BookmarkPlus className="size-3.5" />
          حفظ في معرفة السيارة
        </button>
      )}
    </div>
  );
}

// ─── DTC Inline Cards ─────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<DtcCode["severity"], { bar: string; badge: string }> = {
  low: { bar: "border-l-4 border-green-500/60", badge: "bg-green-500/10 text-green-400" },
  medium: { bar: "border-l-4 border-yellow-500/60", badge: "bg-yellow-500/10 text-yellow-400" },
  high: { bar: "border-l-4 border-orange-500/60", badge: "bg-orange-500/10 text-orange-400" },
  critical: { bar: "border-l-4 border-red-500/70", badge: "bg-red-500/10 text-red-400" },
};

export function DtcInlineCards({ text }: { text: string }) {
  const dtcs = extractDtcCodesFromText(text);
  if (dtcs.length === 0) return null;

  return (
    <div className="mb-2 space-y-2" data-testid="dtc-inline-cards">
      {dtcs.map((dtc) => {
        const style = SEVERITY_STYLES[dtc.severity];
        return (
          <div
            key={dtc.code}
            className={`rounded-lg bg-muted/40 p-3 text-start ${style.bar}`}
            data-testid={`dtc-card-${dtc.code}`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <AlertTriangle className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="font-mono text-xs font-bold text-foreground">{dtc.code}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${style.badge}`}
              >
                {dtc.severity}
              </span>
              <span className="text-xs text-muted-foreground">{dtc.system}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">{dtc.description}</p>
            {dtc.causes && dtc.causes.length > 0 && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                الأسباب المحتملة:{" "}
                <span className="text-foreground/70">{dtc.causes.join("، ")}</span>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
