"use client";

/**
 * Date box + time dropdown, in place of a single datetime-local input.
 *
 * Browsers ignore `step` in the datetime-local picker, so people were offered
 * every minute. A plain select guarantees quarter-hour times everywhere, and
 * is easier to use on a phone.
 *
 * The value is the same "YYYY-MM-DDTHH:mm" string the form submits.
 */

const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const hours = String(Math.floor(i / 4)).padStart(2, "0");
  const minutes = String((i % 4) * 15).padStart(2, "0");
  return `${hours}:${minutes}`;
});

/** Evening is the common case for Langport events */
const DEFAULT_TIME = "19:00";

interface Props {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  /** Earliest date allowed, "YYYY-MM-DD" */
  minDate?: string;
  className?: string;
}

export default function DateTimeFields({
  id,
  name,
  value,
  onChange,
  required,
  minDate,
  className = "",
}: Props) {
  const [date = "", time = ""] = value.split("T");

  const setDate = (nextDate: string) => {
    if (!nextDate) {
      onChange("");
      return;
    }
    onChange(`${nextDate}T${time || DEFAULT_TIME}`);
  };

  const setTime = (nextTime: string) => {
    if (!date) return;
    onChange(nextTime ? `${date}T${nextTime}` : "");
  };

  // Times already saved that do not land on a quarter hour still need showing
  const options = time && !TIME_OPTIONS.includes(time) ? [time, ...TIME_OPTIONS] : TIME_OPTIONS;

  return (
    <div className="mt-1 flex gap-2">
      <input
        type="date"
        id={id}
        value={date}
        required={required}
        min={minDate}
        onChange={(e) => setDate(e.currentTarget.value)}
        className={`flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary ${className}`}
      />
      <select
        aria-label="Time"
        value={time}
        required={required}
        disabled={!date}
        onChange={(e) => setTime(e.currentTarget.value)}
        className={`w-28 rounded-lg border border-gray-300 px-2 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400 ${className}`}
      >
        <option value="">Time</option>
        {options.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {/* What actually gets submitted */}
      <input type="hidden" name={name} value={value} />
    </div>
  );
}
