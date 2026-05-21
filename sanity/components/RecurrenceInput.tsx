import { useCallback, useMemo } from "react";
import { set, unset } from "sanity";
import type { StringInputProps } from "sanity";
import { useFormValue } from "sanity";

const DAY_CODES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"] as const;
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const ORDINALS = ["", "1st", "2nd", "3rd", "4th"];

type Freq = "none" | "weekly" | "biweekly" | "monthly-date" | "monthly-weekday" | "yearly";

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function parseFreq(rrule: string | undefined): Freq {
  if (!rrule) return "none";
  const parts: Record<string, string> = {};
  rrule
    .replace(/^RRULE:/i, "")
    .split(";")
    .forEach((p) => {
      const [k, v] = p.split("=");
      if (k) parts[k.toUpperCase()] = v ?? "";
    });
  if (parts.FREQ === "WEEKLY")
    return parseInt(parts.INTERVAL || "1") === 2 ? "biweekly" : "weekly";
  if (parts.FREQ === "MONTHLY")
    return parts.BYDAY ? "monthly-weekday" : "monthly-date";
  if (parts.FREQ === "YEARLY") return "yearly";
  return "none";
}

function buildRRule(freq: Freq, startDate: string | undefined): string | undefined {
  if (freq === "none") return undefined;
  if (!startDate) return undefined;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return undefined;

  const dayCode = DAY_CODES[start.getDay()];
  const weekNum = Math.min(Math.ceil(start.getDate() / 7), 4);
  const dayOfMonth = start.getDate();
  const month = start.getMonth() + 1;

  switch (freq) {
    case "weekly":         return `FREQ=WEEKLY;BYDAY=${dayCode}`;
    case "biweekly":       return `FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayCode}`;
    case "monthly-date":   return `FREQ=MONTHLY;BYMONTHDAY=${dayOfMonth}`;
    case "monthly-weekday":return `FREQ=MONTHLY;BYDAY=${weekNum}${dayCode}`;
    case "yearly":         return `FREQ=YEARLY;BYMONTH=${month};BYMONTHDAY=${dayOfMonth}`;
  }
}

function describe(freq: Freq, startDate: string | undefined): string {
  if (freq === "none") return "";
  if (!startDate) return "Set a start date above — the rule is derived from it.";
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return "Invalid start date.";

  const dayName = DAY_NAMES[start.getDay()];
  const weekNum = Math.min(Math.ceil(start.getDate() / 7), 4);
  const ordinal = ORDINALS[weekNum];
  const dayOfMonth = start.getDate();

  switch (freq) {
    case "weekly":          return `Every ${dayName}`;
    case "biweekly":        return `Every other ${dayName}`;
    case "monthly-date":    return `On the ${ordinalSuffix(dayOfMonth)} of every month`;
    case "monthly-weekday": return `On the ${ordinal} ${dayName} of every month`;
    case "yearly":          return `Every year on ${start.toLocaleDateString("en-GB", { day: "numeric", month: "long" })}`;
  }
}

export function RecurrenceInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;
  const startDate = useFormValue(["date"]) as string | undefined;

  const freq = useMemo(() => parseFreq(value), [value]);
  const preview = useMemo(() => describe(freq, startDate), [freq, startDate]);
  const rruleString = useMemo(() => buildRRule(freq, startDate), [freq, startDate]);

  const handleChange = useCallback(
    (newFreq: Freq) => {
      const rule = buildRRule(newFreq, startDate);
      onChange(rule ? set(rule) : unset());
    },
    [onChange, startDate],
  );

  // Labels are derived from the current start date so they show the actual day/date.
  const start = startDate ? new Date(startDate) : null;
  const isValidStart = start && !isNaN(start.getTime());
  const dayName = isValidStart ? DAY_NAMES[start.getDay()] : "[weekday]";
  const dayOfMonth = isValidStart ? start.getDate() : null;
  const weekNum = isValidStart ? Math.min(Math.ceil(start.getDate() / 7), 4) : null;
  const ordinal = weekNum ? ORDINALS[weekNum] : "[nth]";

  const options: { value: Freq; label: string }[] = [
    { value: "none",             label: "Does not repeat" },
    { value: "weekly",           label: `Weekly — every ${dayName}` },
    { value: "biweekly",         label: `Every 2 weeks — every other ${dayName}` },
    { value: "monthly-date",     label: dayOfMonth ? `Monthly — on the ${ordinalSuffix(dayOfMonth)}` : "Monthly — same date each month" },
    { value: "monthly-weekday",  label: isValidStart ? `Monthly — ${ordinal} ${dayName} of the month` : "Monthly — same weekday each month" },
    { value: "yearly",           label: "Yearly — same date each year" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {!isValidStart && (
        <p style={{ margin: 0, fontSize: "12px", color: "#b45309", background: "#fef3c7", padding: "6px 10px", borderRadius: "4px" }}>
          Set the <strong>Start Date &amp; Time</strong> field first — recurrence options are derived from it.
        </p>
      )}

      <select
        value={freq}
        disabled={readOnly || false}
        onChange={(e) => handleChange(e.target.value as Freq)}
        style={{
          padding: "8px 12px",
          border: "1px solid #cbd5e0",
          borderRadius: "6px",
          fontSize: "14px",
          background: readOnly ? "#f7fafc" : "white",
          width: "100%",
          cursor: readOnly ? "not-allowed" : "pointer",
          color: "#1a202c",
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {freq !== "none" && (
        <div style={{ padding: "10px 12px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "6px" }}>
          <div style={{ fontSize: "13px", color: "#0c4a6e" }}>
            <strong>Repeats:</strong> {preview}
          </div>
          {rruleString && (
            <div style={{ marginTop: "4px", fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
              {rruleString}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
