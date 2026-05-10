// One-off: send a single test moderation email using the same env vars
// the live submission API uses. Verifies your Resend setup without
// creating a real Sanity document.
//
// Run: node --use-system-ca scripts/test-moderation-email.mjs
import { Resend } from "resend";
import { readFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const apiKey = env.RESEND_API_KEY;
if (!apiKey || apiKey === "your_resend_key_here") {
  console.error("✗ RESEND_API_KEY missing or still placeholder in .env.local");
  process.exit(1);
}
const to = env.MODERATION_RECIPIENT || "office@langport.life";
const from = env.RESEND_FROM_EMAIL || "Langport Life <onboarding@resend.dev>";
const studioBase = env.NEXT_PUBLIC_STUDIO_URL || "https://langport.life/studio";

console.log("Sending test moderation email…");
console.log(`  from: ${from}`);
console.log(`  to:   ${to}`);
console.log(`  studio link will be: ${studioBase}/structure/event;TEST_DOC_ID`);

const resend = new Resend(apiKey);
try {
  const result = await resend.emails.send({
    from,
    to,
    subject: "[Langport Life] TEST — moderation notification setup check",
    text: [
      "This is a test message from the Langport Life submission system.",
      "If you're reading this, your Resend setup is working.",
      "",
      "Title: TEST EVENT — please ignore",
      "Submitted by: Setup Test <test@example.com>",
      "",
      "Review and approve in the Studio:",
      `${studioBase}/structure/event;TEST_DOC_ID`,
      "",
      "(No real event was created. This is just a wiring check.)",
    ].join("\n"),
  });
  if (result.error) {
    console.error("\n✗ Resend reported an error:", result.error);
    process.exit(1);
  }
  console.log(`\n✓ Sent. Resend message id: ${result.data?.id}`);
  console.log(`  Check ${to} (and Spam) within ~30 seconds.`);
} catch (err) {
  console.error("\n✗ Send failed:", err);
  process.exit(1);
}
