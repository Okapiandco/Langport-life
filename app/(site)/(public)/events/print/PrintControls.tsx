"use client";

export default function PrintControls({
  from,
  to,
  count,
}: {
  from: string;
  to: string;
  count: number;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-end gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
      <form method="GET" className="flex flex-wrap items-end gap-3 flex-1">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="block rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="block rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 transition"
        >
          Load Events
        </button>
      </form>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {count} event{count !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.75 19.5m10.56-5.671-.72.096m.72-.096L17.25 19.5M3 10.5h18M6.75 15.75h10.5" />
          </svg>
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
