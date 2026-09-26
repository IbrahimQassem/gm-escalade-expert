export const VEHICLE = {
  vin: "1GYUKEEJ7AR246464",
  year: 2010,
  make: "Cadillac",
  model: "Escalade Hybrid",
  engine: "6.0L V8 Full Hybrid EV-Flex (FHEV) — 2-Mode Hybrid",
  drivetrain: "4WD",
  arabic: {
    title: "خبير كاديلاك إسكاليد هايبرد 2010",
    subtitle: "مساعد فني متخصص لهذه المركبة فقط",
  },
} as const;

export type SectionId =
  | "chat"
  | "parts"
  | "diagnostics"
  | "maintenance"
  | "procedures"
  | "hybrid"
  | "electrical"
  | "evidence"
  | "knowledge"
  | "dtc";

export type Section = {
  id: SectionId;
  label: string;
  hint: string;
  icon: string;
  focus?: string;
  suggestions?: string[];
};

export const SECTIONS: Section[] = [
  {
    id: "chat",
    label: "محادثة الخبير",
    hint: "أي سؤال عن السيارة",
    icon: "MessageSquare",
    focus: "سؤال عام مفتوح عن أي نظام في المركبة.",
    suggestions: [
      "السيارة ترتج عند التسارع الخفيف، ما الأسباب الأكثر ترجيحاً؟",
      "ما الفرق بين نسخة الهايبرد والنسخة العادية في نظام الفرامل؟",
    ],
  },
  {
    id: "parts",
    label: "القطع والمطابقة",
    hint: "أرقام OEM والمطابقة",
    icon: "Package",
    focus:
      "سؤال عن قطعة غيار: يجب استخدام صيغة النتيجة النهائية للقطع (GM Genuine ثم ACDelco ثم الاستبدالات ثم المطابقة ثم يمين/يسار ثم ملاحظات الهايبرد/الدفع الرباعي ثم ما يجب التحقق منه ثم المصادر).",
    suggestions: [
      "رقم طقم رمان بلي/هَب العجلة الأمامية الأصلي (Front Wheel Hub & Bearing Assembly)",
      "فلاتر الزيت والهواء الأصلية لهذا المحرك",
    ],
  },
  {
    id: "diagnostics",
    label: "التشخيص",
    hint: "الأعطال والأكواد",
    icon: "Stethoscope",
    focus:
      "سؤال تشخيصي: استخدم صيغة التشخيص (التشخيص الأكثر دعماً، الاختبارات الحاسمة، تفسير النتائج، الخطوة التالية). لا تنصح باستبدال قطعة قبل وجود دليل.",
    suggestions: [
      "كود P0300 مع رجّة عند السرعات المنخفضة",
      "صوت طقطقة من الأمام عند المنعطفات",
    ],
  },
  {
    id: "maintenance",
    label: "الصيانة",
    hint: "الفترات والسوائل",
    icon: "CalendarClock",
    focus: "سؤال صيانة: فترات الخدمة، السوائل، السعات، المواصفات المعتمدة من GM.",
    suggestions: ["جدول الصيانة الدوري لهذه السيارة", "نوع وسعة زيت المحرك وزيت ناقل الحركة الهايبرد"],
  },
  {
    id: "procedures",
    label: "إجراءات الخدمة",
    hint: "خطوات الإصلاح",
    icon: "Wrench",
    focus: "سؤال عن إجراء خدمة: خطوات مختصرة، عزوم الشد، أدوات خاصة، تحذيرات السلامة.",
    suggestions: ["خطوات تغيير هَب العجلة الأمامية وعزوم الشد", "إجراء تغيير سائل ناقل الحركة"],
  },
  {
    id: "hybrid",
    label: "نظام الهايبرد",
    hint: "الجهد العالي والبطارية",
    icon: "BatteryCharging",
    focus:
      "سؤال عن نظام الهايبرد ثنائي النمط/الجهد العالي: أضف تحذير سلامة مختصر ووجّه لإجراءات المصنع/الفني المختص.",
    suggestions: ["أعراض ضعف بطارية الهايبرد 300 فولت", "كيف يعمل نظام الفرامل التجديدية هنا؟"],
  },
  {
    id: "electrical",
    label: "الكهرباء والأسلاك",
    hint: "الدوائر والحساسات",
    icon: "Zap",
    focus: "سؤال كهربائي: مفاهيم الدوائر، الحساسات، الموصلات، الوحدات، طرق القياس.",
    suggestions: ["مواقع الفيوزات الرئيسية ووظائفها", "كيف أفحص حساس ABS الأمامي الأيسر؟"],
  },
];

export const CHAT_SECTIONS = SECTIONS.map((s) => s.id);

export const SEED_TOPIC =
  "2010 Cadillac Escalade Hybrid 6.0L 4WD — Front Wheel Hub & Bearing Assembly (factory-original replacement)";
