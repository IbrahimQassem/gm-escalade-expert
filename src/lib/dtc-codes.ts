/**
 * 2010 Cadillac Escalade Hybrid — 2-Mode Hybrid DTC lookup table.
 *
 * Contains common trouble codes for the high-voltage hybrid system,
 * hybrid battery pack, and related subsystems. Each entry is machine-
 * readable and human-readable so the chat panel can surface them inline.
 */

export type DtcSeverity = "low" | "medium" | "high" | "critical";

export type DtcCode = {
  /** SAE / GM DTC code, e.g. "P0A80" */
  code: string;
  /** Short human-readable description */
  description: string;
  /** Subsystem owning this fault */
  system: string;
  /** Operational urgency */
  severity: DtcSeverity;
  /** Common root causes (optional, for richer search hits) */
  causes?: string[];
};

export const DTC_CODES: DtcCode[] = [
  // ── Hybrid Battery Pack ────────────────────────────────────────────────────
  {
    code: "P0A80",
    description: "Replace Hybrid Battery Pack — cell voltage imbalance or degradation detected",
    system: "Hybrid Battery Pack",
    severity: "critical",
    causes: ["aged NiMH cells", "cell reversal", "battery management module fault"],
  },
  {
    code: "P0A7F",
    description: "Hybrid Battery Pack State of Health — capacity below minimum threshold",
    system: "Hybrid Battery Pack",
    severity: "high",
    causes: ["battery aging", "excessive charge/discharge cycles", "cell sulfation"],
  },
  {
    code: "P0AC4",
    description: "Hybrid Battery Pack Current Sensor Circuit — signal out of range",
    system: "Hybrid Battery Pack",
    severity: "high",
    causes: ["current sensor fault", "wiring harness damage", "BECM failure"],
  },
  {
    code: "P0A1A",
    description: "Hybrid Battery Pack Cooling Fan 1 Performance — reduced airflow",
    system: "Hybrid Battery Cooling",
    severity: "medium",
    causes: ["clogged fan inlet", "fan motor failure", "blocked cabin air filter"],
  },
  // ── Hybrid Powertrain / 2-Mode ────────────────────────────────────────────
  {
    code: "P0C05",
    description: "Drive Motor 'A' Inverter Performance — Motor A torque output fault",
    system: "2-Mode Hybrid Drive Motor",
    severity: "critical",
    causes: ["inverter capacitor fault", "motor winding short", "power electronics overtemp"],
  },
  {
    code: "P0C04",
    description: "Drive Motor 'A' Inverter Temperature Sensor — circuit malfunction",
    system: "2-Mode Hybrid Drive Motor",
    severity: "medium",
    causes: ["inverter temp sensor open circuit", "connector corrosion"],
  },
  {
    code: "P0B44",
    description: "Generator/Motor B Overcurrent — high-voltage bus overcurrent event",
    system: "2-Mode Hybrid Generator Motor",
    severity: "high",
    causes: ["stator winding fault", "inverter phase leg failure", "HV bus short"],
  },
  // ── High Voltage System ────────────────────────────────────────────────────
  {
    code: "P1E00",
    description: "Hybrid/EV Battery System Malfunction — general HV isolation fault",
    system: "High Voltage System",
    severity: "critical",
    causes: ["HV cable insulation breakdown", "coolant leak into HV components", "contactor weld"],
  },
  {
    code: "P0AA6",
    description: "Hybrid Battery Voltage System Isolation Fault — insulation resistance below limit",
    system: "High Voltage System",
    severity: "critical",
    causes: ["moisture ingress", "wiring chafe", "HV contactor fault"],
  },
  // ── Engine / Cylinder-Related ─────────────────────────────────────────────
  {
    code: "P0300",
    description: "Random/Multiple Cylinder Misfire Detected",
    system: "Engine Combustion",
    severity: "high",
    causes: ["fouled spark plugs", "injector fault", "low compression", "coil failure"],
  },
  {
    code: "P0171",
    description: "System Too Lean — Bank 1 fuel trim out of range",
    system: "Fuel System",
    severity: "medium",
    causes: ["vacuum leak", "MAF sensor fault", "clogged fuel injector"],
  },
];

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/**
 * Returns the single DTC entry for an exact code match (case-insensitive),
 * or `undefined` if not found.
 */
export function getDtcByCode(code: string): DtcCode | undefined {
  if (!code) return undefined;
  const normalized = code.toUpperCase();
  return DTC_CODES.find((d) => d.code === normalized);
}

/**
 * Fuzzy search across code, description, system, and causes.
 *
 * - Empty query returns all codes.
 * - Exact code matches are ranked first.
 * - All other matches are returned in definition order.
 */
export function searchDtcCodes(query: string): DtcCode[] {
  if (!query) return DTC_CODES;

  const q = query.toLowerCase();

  const exactCode: DtcCode[] = [];
  const rest: DtcCode[] = [];

  for (const dtc of DTC_CODES) {
    const inCode = dtc.code.toLowerCase().includes(q);
    const inDesc = dtc.description.toLowerCase().includes(q);
    const inSystem = dtc.system.toLowerCase().includes(q);
    const inCauses = dtc.causes?.some((c) => c.toLowerCase().includes(q)) ?? false;

    if (!inCode && !inDesc && !inSystem && !inCauses) continue;

    if (dtc.code.toLowerCase() === q) {
      exactCode.push(dtc);
    } else {
      rest.push(dtc);
    }
  }

  return [...exactCode, ...rest];
}

/**
 * Scans free text (user message or chat input) for SAE P-code patterns
 * and returns the matching `DtcCode` entries from the lookup table.
 *
 * - Only returns codes that exist in `DTC_CODES` (unknown codes are ignored).
 * - Case-insensitive; deduplicates repeated mentions of the same code.
 * - Returns results in the order they first appear in the text.
 */
export function extractDtcCodesFromText(text: string): DtcCode[] {
  const P_CODE_RE = /\bP[0-9A-Z]{4}\b/gi;
  const matches = text.match(P_CODE_RE) ?? [];

  const seen = new Set<string>();
  const results: DtcCode[] = [];

  for (const raw of matches) {
    const code = raw.toUpperCase();
    if (seen.has(code)) continue;
    seen.add(code);
    const dtc = getDtcByCode(code);
    if (dtc) results.push(dtc);
  }

  return results;
}
