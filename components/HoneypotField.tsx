// Hidden anti-spam field. Humans never see or fill it; bots that auto-fill
// every input give themselves away and the API silently discards the request.
export default function HoneypotField({ name }: { name: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name={name} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
