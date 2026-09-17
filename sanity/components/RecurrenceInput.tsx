import { useCallback, useMemo, type CSSProperties } from "react";
import { set, unset } from "sanity";
import type { StringInputProps } from "sanity";
import { useFormValue } from "sanity";

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
// Selects list Monday first, as UK editors expect.
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];
const ORDINAL_OPTIONS = [
  { value: 1, label: "1st" },
  { value: 2, label: "2nd" },
  { value: 3, label: "3rd" },
  { value: 4, label: "4th" },
  { value: -1, label: "Last" },
];

type Freq = "none" | "weekly" | "biweekly" | "monthly-date" | "monthly-weekday" | "yearly";

interface ParsedRule {
  freq: Freq;
  /** 0-6 (Sunday-Saturday); only meaningful for weekly/biweekly/monthly-weekday. */
  weekday: number | null;
  /** 1-4 or -1 (last); only meaningful for monthly-weekday. */
  weekNum: number | null;
}

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function ordinalLabel(weekNum: number): string {
  return ORDINAL_OPTIONS.find((o) => o.value === weekNum)?.label ?? `${weekNum}th`;
}

function parseRule(rrule: string | undefined): ParsedRule {
  if (!rrule) return { freq: "none", weekday: null, weekNum: null };
  const parts: Record<string, string> = {};
  rrule
    .replace(/^RRULE:/i, "")
    .split(";")
    .forEach((p) => {
      const [k, v] = p.split("=");
      if (k) parts[k.toUpperCase()] = v ?? "";
    });

  // BYDAY is either "MO" (weekly) or "3MO" / "-1MO" (monthly-weekday).
  let weekday: number | null = null;
  let weekNum: number | null = null;
  if (parts.BYDAY) {
    const m = parts.BYDAY.match(/^(-?\d+)?([A-Z]{2})$/);
    if (m) {
      weekday = DAY_CODES.indexOf(m[2] as (typeof DAY_CODES)[number]);
      if (weekday === -1) weekday = null;
      if (m[1]) weekNum = parseInt(m[1], 10);
    }
  }

  if (parts.FREQ === "WEEKLY") {
    const freq = parseInt(parts.INTERVAL || "1") === 2 ? "biweekly" : "weekly";
    return { freq, weekday, weekNum: null };
  }
  if (parts.FREQ === "MONTHLY") {
    if (parts.BYDAY) return { freq: "monthly-weekday", weekday, weekNum };
    return { freq: "monthly-date", weekday: null, weekNum: null };
  }
  if (parts.FREQ === "YEARLY") return { freq: "yearly", weekday: null, weekNum: null };
  return { freq: "none", weekday: null, weekNum: null };
}

function buildRRule(
  freq: Freq,
  startDate: string | undefined,
  weekday: number | null,
  weekNum: number | null
): string | undefined {
  if (freq === "none") return undefined;
  if (!startDate) return undefined;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return undefined;

  // Day/week fall back to values derived from the start date when unset.
  const day = weekday ?? start.getDay();
  const dayCode = DAY_CODES[day];
  const week = weekNum ?? Math.min(Math.ceil(start.getDate() / 7), 4);
  const dayOfMonth = start.getDate();
  const month = start.getMonth() + 1;

  switch (freq) {
    case "weekly":          return `FREQ=WEEKLY;BYDAY=${dayCode}`;
    case "biweekly":        return `FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayCode}`;
    case "monthly-date":    return `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`;
    case "monthly-weekday": return `FREQ=MONTHLY;BYDAY=${week}${dayCode}`;
    case "yearly":          return `FREQ=YEARLY;BYMONTH=${month};BYMONTHDAY=${dayOfMonth}`;
  }
}

function describe(rule: ParsedRule, startDate: string | undefined): string {
  if (rule.freq === "none") return "";
  if (!startDate) return "Set a start date above first.";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "Invalid start date.";

  const dayName = DAY_NAMES[rule.weekday ?? start.getDay()];
  const week = rule.weekNum ?? Math.min(Math.ceil(start.getDate() / 7), 4);
  const dayOfMonth = start.getDate();

  switch (rule.freq) {
    case "weekly":          return `Every ${dayName}`;
    case "biweekly":        return `Every other ${dayName}`;
    case "monthly-date":    return `On the ${ordinalSuffix(dayOfMonth)} of every month`;
    case "monthly-weekday": return `On the ${ordinalLabel(week).toLowerCase()} ${dayName} of every month`;
    case "yearly":          return `Every year on ${start.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  }
}

const selectStyle = (readOnly: boolean | undefined): CSSProperties => ({
  padding: "8px 12px",
  border: "1px solid #cbd5e0",
  borderRadius: "6px",
  fontSize: "14px",
  background: readOnly ? "#f7fafc" : "white",
  cursor: readOnly ? "not-allowed" : "pointer",
  color: "#1a202c",
});

export function RecurrenceInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;
  const startDate = useFormValue(["date"]) as string | undefined;

  const rule = useMemo(() => parseRule(value), [value]);
  const preview = useMemo(() => describe(rule, startDate), [rule, startDate]);

  const start = startDate ? new Date(startDate) : null;
  const isValidStart = !!start && !isNaN(start.getTime());

  // Effective selections shown in the pickers (rule value, else derived from start).
  const effectiveWeekday = rule.weekday ?? (isValidStart ? start.getDay() : 1);
  const effectiveWeekNum =
    rule.weekNum ?? (isValidStart ? Math.min(Math.ceil(start.getDate() / 7), 4) : 1);

  const emit = useCallback(
    (freq: Freq, weekday: number | null, weekNum: number | null) => {
      const next = buildRRule(freq, startDate, weekday, weekNum);
      onChange(next ? set(next) : unset());
    },
    [onChange, startDate],
  );

  const showDayPicker = ["weekly", "biweekly", "monthly-weekday"].includes(rule.freq);
  const showWeekPicker = rule.freq === "monthly-weekday";
  const weekdayMismatch =
    isValidStart && showDayPicker && effectiveWeekday !== start.getDay();

  const dayOfMonth = isValidStart ? start.getDate() : null;

  const options: { value: Freq; label: string }[] = [
    { value: "none",            label: "Does not repeat" },
    { value: "weekly",          label: "Weekly" },
    { value: "biweekly",        label: "Every 2 weeks" },
    { value: "monthly-date",    label: dayOfMonth ? `Monthly — on the ${ordinalSuffix(dayOfMonth)}` : "Monthly — same date each month" },
    { value: "monthly-weekday", label: "Monthly — on a chosen weekday" },
    { value: "yearly",          label: "Yearly — same date each year" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {!isValidStart && (
        <p style={{ margin: 0, fontSize: "12px", color: "#b45309", background: "#fef3c7", padding: "6px 10px", borderRadius: "4px" }}>
          Set the <strong>Start Date &amp; Time</strong> field first — it sets the time of day (and the date for date-based repeats).
        </p>
      )}

      <select
        value={rule.freq}
        disabled={readOnly || false}
        onChange={(e) => {
          const freq = e.target.value as Freq;
          // Fresh frequency: keep an already-chosen day where it still applies.
          emit(freq, showDayPicker ? rule.weekday : null, null);
        }}
        style={{ ...selectStyle(readOnly), width: "100%" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {(showDayPicker || showWeekPicker) && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "#4a5568" }}>Repeats on</span>
          {showWeekPicker && (
            <select
              value={effectiveWeekNum}
              disabled={readOnly || false}
              onChange={(e) => emit(rule.freq, effectiveWeekday, parseInt(e.target.value, 10))}
              style={selectStyle(readOnly)}
            >
              {ORDINAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          <select
            value={effectiveWeekday}
            disabled={readOnly || false}
            onChange={(e) =>
              emit(rule.freq, parseInt(e.target.value, 10), showWeekPicker ? effectiveWeekNum : null)
            }
            style={selectStyle(readOnly)}
          >
            {DAY_ORDER.map((d) => (
              <option key={d} value={d}>
                {DAY_NAMES[d]}
              </option>
            ))}
          </select>
        </div>
      )}

      {weekdayMismatch && (
        <p style={{ margin: 0, fontSize: "12px", color: "#0c4a6e", background: "#f0f9ff", border: "1px solid #bae6fd", padding: "6px 10px", borderRadius: "4px" }}>
          The start date is a {DAY_NAMES[start.getDay()]}. Occurrences will follow the repeat rule
          ({DAY_NAMES[effectiveWeekday]}s) — the start date only sets the time of day.
        </p>
      )}

      {rule.freq !== "none" && (
        <div style={{ padding: "10px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px" }}>
          <div style={{ fontSize: "13px", color: "#0c4a6e" }}>
            <strong>Repeats:</strong> {preview}
          </div>
          {value && (
            <div style={{ marginTop: "4px", fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
              {value}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
