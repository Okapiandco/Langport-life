"use client";

import { useEffect, useState } from "react";

const FONT_SCALE_STEPS = [1, 1.15, 1.3, 1.5];
const STORAGE_KEY = "langport-a11y";

interface A11yPrefs {
  scaleIndex: number;
  contrast: boolean;
  reduceMotion: boolean;
}

const DEFAULTS: A11yPrefs = { scaleIndex: 0, contrast: false, reduceMotion: false };

function readStoredPrefs(): A11yPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function applyToDocument(prefs: A11yPrefs) {
  const root = document.documentElement;
  root.style.setProperty("--font-scale", String(FONT_SCALE_STEPS[prefs.scaleIndex] ?? 1));
  root.classList.toggle("a11y-contrast", prefs.contrast);
  root.classList.toggle("a11y-reduce-motion", prefs.reduceMotion);
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(() => readStoredPrefs());

  // Sync to the DOM + localStorage whenever prefs change (including on mount).
  useEffect(() => {
    applyToDocument(prefs);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* storage may be unavailable */
    }
  }, [prefs]);

  function update(patch: (prev: A11yPrefs) => Partial<A11yPrefs>) {
    setPrefs((prev) => ({ ...prev, ...patch(prev) }));
  }

  function reset() {
    update(() => DEFAULTS);
  }

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-label="Accessibility options"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 left-5 z-[60] flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-2xl text-white shadow-2xl ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <span aria-hidden="true">♿</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Accessibility options"
          className="fixed bottom-[84px] left-5 z-[60] w-64 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-900 shadow-2xl ring-1 ring-black/5"
        >
          <div className="mb-3 flex items-center justify-between font-semibold">
            <span>Accessibility</span>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="mb-3">
            <span className="mb-2 block text-xs text-gray-500">Text size</span>
            <div className="flex items-center gap-2" role="group" aria-label="Text size">
              <button
                type="button"
                onClick={() => update((prev) => ({ scaleIndex: Math.max(0, prev.scaleIndex - 1) }))}
                disabled={prefs.scaleIndex === 0}
                aria-label="Decrease text size"
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 py-1.5 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                A−
              </button>
              <span className="w-11 text-center text-xs tabular-nums" aria-live="polite">
                {Math.round((FONT_SCALE_STEPS[prefs.scaleIndex] ?? 1) * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  update((prev) => ({ scaleIndex: Math.min(FONT_SCALE_STEPS.length - 1, prev.scaleIndex + 1) }))
                }
                disabled={prefs.scaleIndex === FONT_SCALE_STEPS.length - 1}
                aria-label="Increase text size"
                className="flex-1 rounded-lg border border-gray-300 bg-gray-50 py-1.5 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40"
              >
                A+
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 py-1.5">
            <input
              type="checkbox"
              checked={prefs.contrast}
              onChange={(e) => update(() => ({ contrast: e.target.checked }))}
              className="h-[18px] w-[18px] accent-primary"
            />
            High contrast
          </label>

          <label className="flex cursor-pointer items-center gap-2 py-1.5">
            <input
              type="checkbox"
              checked={prefs.reduceMotion}
              onChange={(e) => update(() => ({ reduceMotion: e.target.checked }))}
              className="h-[18px] w-[18px] accent-primary"
            />
            Reduce motion
          </label>

          <button
            type="button"
            onClick={reset}
            className="mt-2 w-full rounded-lg border border-gray-300 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      )}
    </>
  );
}
