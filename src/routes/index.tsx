import { createFileRoute } from "@tanstack/react-router";
import {
  BatteryCharging,
  BookOpen,
  CalendarClock,
  Library,
  MessageSquare,
  Package,
  Stethoscope,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { ChatPanel } from "@/components/chat-panel";
import { VehicleCard } from "@/components/vehicle-card";
import { AnswerBody, DecisionCard, parseAnswer } from "@/components/decision";
import { useSavedFacts, useSources } from "@/lib/store";
import { SECTIONS, SEED_TOPIC, VEHICLE, type SectionId } from "@/lib/vehicle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "خبير GM إسكاليد هايبرد 2010 — مساعد فني بالأدلة" },
      {
        name: "description",
        content:
          "مساعد فني متخصص لسيارة كاديلاك إسكاليد هايبرد 2010 6.0 دفع رباعي: تشخيص، قطع أصلية، صيانة، ونظام الهايبرد مع تحقق من المصادر.",
      },
      { property: "og:title", content: "خبير GM إسكاليد هايبرد 2010" },
      {
        property: "og:description",
        content: "تشخيص وقطع وصيانة مدعومة بالأدلة لسيارة إسكاليد هايبرد 2010 بالـ VIN المحدد.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

const ICONS: Record<string, React.ElementType> = {
  MessageSquare,
  Package,
  Stethoscope,
  CalendarClock,
  Wrench,
  BatteryCharging,
  Zap,
};

function App() {
  const [active, setActive] = useState<SectionId>("chat");
  const section = SECTIONS.find((s) => s.id === active);

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-surface/95 px-3 py-3 backdrop-blur sm:px-5">
        <VehicleCard />
      </header>

      <nav className="sticky top-[126px] z-10 border-b border-border/60 bg-background/95 px-2 backdrop-blur sm:px-4">
        <div className="flex gap-1 overflow-x-auto py-2">
          {SECTIONS.map((s) => {
            const Icon = ICONS[s.icon] ?? MessageSquare;
            return (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`nav-tab ${active === s.id ? "nav-tab-active" : ""}`}
              >
                <Icon className="size-4" />
                {s.label}
              </button>
            );
          })}
          <button
            onClick={() => setActive("evidence")}
            className={`nav-tab ${active === "evidence" ? "nav-tab-active" : ""}`}
          >
            <Library className="size-4" />
            الأدلة والمصادر
          </button>
          <button
            onClick={() => setActive("knowledge")}
            className={`nav-tab ${active === "knowledge" ? "nav-tab-active" : ""}`}
          >
            <BookOpen className="size-4" />
            معرفة السيارة
          </button>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-3 py-4 sm:px-5">
        {section ? (
          <ChatPanel key={section.id} section={section} />
        ) : active === "evidence" ? (
          <EvidencePanel />
        ) : (
          <KnowledgePanel />
        )}
      </main>

      <footer className="border-t border-border/60 px-4 py-3 text-center text-[11px] leading-5 text-muted-foreground">
        منهجية فنية تحاكي خبرة GM التشخيصية — دون ادعاء توظيف أو شهادات أو وصول لقواعد بيانات GM
        الخاصة. الإجابات «مُتحقق منها بحسب الأدلة المتاحة» وليست ضماناً. الأنظمة الحرجة والجهد
        العالي تتطلب فنياً مؤهلاً.
      </footer>
    </div>
  );
}

function EvidencePanel() {
  const [sources, setSources] = useSources();
  return (
    <section className="space-y-3">
      <PanelHead
        title="الأدلة والمصادر"
        desc="كل مصدر تم الاستشهاد به أثناء البحث لهذه المركبة، مع الموضوع وتاريخ الجمع."
      />
      {sources.length === 0 ? (
        <p className="empty-state text-sm text-muted-foreground">
          لا توجد مصادر بعد. اطرح سؤالاً يتطلب بحثاً وستُجمع المصادر هنا تلقائياً.
        </p>
      ) : (
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.url} className="source-card">
              <a href={s.url} target="_blank" rel="noreferrer" className="source-link font-medium">
                {s.title}
              </a>
              <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{s.url}</p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{new Date(s.addedAt).toLocaleDateString("ar")}</span>
                {s.topic && <span className="truncate">• {s.topic}</span>}
                <button
                  className="ms-auto icon-btn"
                  onClick={() => setSources((prev) => prev.filter((x) => x.url !== s.url))}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function KnowledgePanel() {
  const [facts, setFacts] = useSavedFacts();
  return (
    <section className="space-y-3">
      <PanelHead
        title="معرفة السيارة المحفوظة"
        desc={`حقائق مُتحقق منها ومحفوظة لهذا الـ VIN: ${VEHICLE.vin}`}
      />
      <div className="seed-card">
        <p className="text-xs font-semibold text-accent">موضوع البحث الأولي</p>
        <p className="mt-1 text-sm text-foreground">{SEED_TOPIC}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          لم يتم تثبيت أي رقم قطعة غير مُتحقق منه. اطلب البحث من قسم «القطع والمطابقة».
        </p>
      </div>
      {facts.length === 0 ? (
        <p className="empty-state text-sm text-muted-foreground">
          لا توجد معرفة محفوظة بعد. احفظ أي إجابة من زر «حفظ في معرفة السيارة».
        </p>
      ) : (
        facts.map((f) => {
          const { decision, body } = parseAnswer(f.content);
          return (
            <article key={f.id} className="assistant-msg">
              {decision && <DecisionCard decision={decision} />}
              {body && <AnswerBody text={body} />}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span>{new Date(f.createdAt).toLocaleDateString("ar")}</span>
                <button
                  className="ms-auto icon-btn"
                  onClick={() => setFacts((prev) => prev.filter((x) => x.id !== f.id))}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}

function PanelHead({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
