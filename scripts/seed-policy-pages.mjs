/**
 * Creates / replaces Privacy Policy, Cookie Policy, and Accessibility Statement
 * as Sanity page documents.
 *
 * Run with:
 *   NODE_OPTIONS=--use-system-ca node --env-file=.env.local scripts/seed-policy-pages.mjs
 */

import { createClient } from "next-sanity";

const client = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const key = () => Math.random().toString(36).slice(2, 10);

function block(text) {
  return {
    _type: "block", _key: key(), style: "normal", markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

function h2(text) {
  return {
    _type: "block", _key: key(), style: "h2", markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

function h3(text) {
  return {
    _type: "block", _key: key(), style: "h3", markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: [] }],
  };
}

async function run() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error("SANITY_API_TOKEN is not set.");
    process.exit(1);
  }

  // ── 1. Privacy Policy ────────────────────────────────────────────────────
  console.log("Creating /privacy-policy...");
  await client.createOrReplace({
    _id: "page-privacy-policy",
    _type: "page",
    title: "Privacy Policy",
    slug: { _type: "slug", current: "privacy-policy" },
    description: "How Langport Town Council and Langport Life handle your personal data.",
    published: true,
    seoDescription: "Langport Life privacy policy — how we collect, use, and protect your personal data under UK GDPR.",
    content: [
      block("Last updated: July 2026"),
      block("Langport Life is operated by Langport Town Council. We are committed to protecting your personal data and handling it in accordance with UK GDPR and the Data Protection Act 2018."),

      h2("Who we are"),
      block("Data controller: Langport Town Council"),
      block("Address: The Town Council Office, Langport, Somerset"),
      block("Email: office@langport.life"),
      block("Phone: 01458 259700"),

      h2("What data we collect"),
      h3("Contact form"),
      block("When you use the contact form on this site, we collect your name, email address, and the content of your message. This data is used only to respond to your enquiry and is not stored on our servers — it is transmitted securely via email to the Town Clerk."),

      h3("Submissions (events, venues, listings, groups)"),
      block("When you submit an event, venue, business listing, or community group for publication on this site, we collect your name, email address, phone number, and details of the submission. This information is:"),
      block("Stored in our content management system (Sanity, hosted by Sanity.io in the EU/US) for the purpose of reviewing and publishing your submission."),
      block("Used to send you a confirmation email and a private edit link so you can update your submission."),
      block("Visible to the Town Clerk and nominated moderators only until approved. Once approved, the business/event/venue name and description become public. Submitter contact details are never published."),
      block("We retain submitted content for as long as it remains live on the site. Events are automatically deleted 30 days after their end date."),

      h3("Cookies and analytics"),
      block("We use Google Analytics to understand how visitors use this site, but only once you have given consent via the cookie banner shown on your first visit. If you reject the banner, or take no action, no analytics cookies are set and no data is sent to Google. You can change your choice at any time using the 'Cookie Preferences' link in the footer. See our Cookie Policy for full details."),

      h2("Legal basis for processing"),
      block("Contact form and submissions: legitimate interests (responding to your enquiry and administering community content), and your consent given by submitting the form."),
      block("Council documents: legal obligation (local authorities must publish agendas, minutes, and financial information)."),

      h2("Your rights"),
      block("Under UK GDPR you have the right to access, correct, or delete personal data we hold about you; to restrict or object to processing; and to data portability. To exercise any of these rights, contact us at office@langport.life."),
      block("You also have the right to complain to the Information Commissioner's Office (ICO) at ico.org.uk if you believe we have not handled your data correctly."),

      h2("Third-party services"),
      block("Resend (resend.com) — used to send transactional emails (submission confirmations and contact form messages). Resend processes email data on servers in the EU. Their privacy policy is at resend.com/privacy."),
      block("Sanity (sanity.io) — our content management system. Submission data is stored on Sanity's infrastructure. Sanity's privacy policy is at sanity.io/legal/privacy."),
      block("OpenStreetMap / Nominatim — used to generate map pins for submitted venues and listings. Address data is sent to Nominatim for geocoding. No personal data is sent."),

      h2("Changes to this policy"),
      block("We may update this policy from time to time. The date at the top of this page shows when it was last revised. Significant changes will be announced on the site."),

      h2("Contact us"),
      block("For any questions about how we handle your data: office@langport.life or 01458 259700."),
    ],
  });
  console.log("  ✓ /privacy-policy created");

  // ── 2. Cookie Policy ─────────────────────────────────────────────────────
  console.log("Creating /cookie-policy...");
  await client.createOrReplace({
    _id: "page-cookie-policy",
    _type: "page",
    title: "Cookie Policy",
    slug: { _type: "slug", current: "cookie-policy" },
    description: "How Langport Life uses cookies.",
    published: true,
    seoDescription: "Langport Life cookie policy — what cookies this site uses and how to control them.",
    content: [
      block("Last updated: July 2026"),
      block("This site uses a small number of strictly necessary cookies to make it work, and — only if you give consent — Google Analytics cookies to help us understand how the site is used. You choose whether to allow analytics cookies via the banner shown on your first visit, and you can change your mind at any time."),

      h2("What is a cookie?"),
      block("A cookie is a small text file stored on your device by your browser. It lets a website remember information between page visits."),

      h2("Cookies we use"),
      h3("Strictly necessary (always on)"),
      block("Session and functionality: cookies may be set by Next.js (our web framework) to maintain session state during form submissions. These expire when you close your browser and contain no personal data."),
      block("Content delivery: static assets on this site are served via Vercel's content delivery network. Vercel may set technical cookies to route requests efficiently. These do not identify you personally."),
      block("These cookies do not require consent and cannot be switched off, as the site cannot function properly without them."),

      h3("Analytics (only with your consent)"),
      block("With your consent, we use Google Analytics (GA4) to understand how visitors use this site — which pages are popular, how people found the site, and so on. This helps us improve it. Google Analytics sets the following cookies once you accept:"),
      block("_ga — used to distinguish users. Expires after 2 years."),
      block("_ga_<container-id> — used to persist session state. Expires after 2 years."),
      block("These cookies are only set after you click 'Accept' on the cookie banner. If you click 'Reject', or take no action, these cookies are never set and no data is sent to Google."),
      block("IP addresses are anonymised, and data is processed by Google in accordance with Google's privacy policy at policies.google.com/privacy."),

      h2("Managing your choice"),
      block("When you first visit this site, a banner asks you to Accept or Reject analytics cookies. You can change your choice at any time by clicking 'Cookie Preferences' in the footer of any page, which reopens the banner."),
      block("You can also control and delete cookies through your browser settings. Disabling strictly necessary cookies may affect the functionality of some forms on this site. Visit aboutcookies.org for guidance on managing cookies across different browsers."),

      h2("Changes to this policy"),
      block("This policy reflects cookies used at the time shown above. If we add new functionality that uses cookies, we will update this page."),

      h2("Questions"),
      block("Email office@langport.life with any questions about cookies on this site."),
    ],
  });
  console.log("  ✓ /cookie-policy updated");

  // ── 3. Accessibility Statement ───────────────────────────────────────────
  console.log("Creating /accessibility...");
  await client.createOrReplace({
    _id: "page-accessibility",
    _type: "page",
    title: "Accessibility Statement",
    slug: { _type: "slug", current: "accessibility" },
    description: "Langport Life accessibility statement — our commitment to inclusive design.",
    published: true,
    seoDescription: "Langport Life accessibility statement under the Public Sector Bodies Accessibility Regulations 2018.",
    content: [
      block("Last reviewed: July 2026"),
      block("This accessibility statement applies to langport.life. This website is run by Langport Town Council. We want as many people as possible to be able to use this website."),

      h2("How accessible this website is"),
      block("We know some parts of this website are not fully accessible. You can see a full list of any issues we currently know about in the 'Known issues' section below."),
      block("We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standard."),

      h2("What you can do if you have trouble"),
      block("If you have difficulty using any part of this site, AbilityNet has advice on making your device easier to use if you have a disability: abilitynet.org.uk"),

      h2("Feedback and contact"),
      block("If you find any accessibility problems not listed below, or if you need information in a different format (such as large print, easy read, audio recording, or Braille), please contact us:"),
      block("Email: office@langport.life"),
      block("Phone: 01458 259700"),
      block("We will consider your request and get back to you within 10 working days."),

      h2("Enforcement procedure"),
      block("The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018. If you're not happy with how we respond to your complaint, contact the Equality Advisory and Support Service (EASS) at equalityadvisoryservice.com."),

      h2("Technical information"),
      block("Langport Town Council is committed to making its website accessible, in accordance with the Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018."),

      h3("Compliance status"),
      block("This website is partially compliant with the Web Content Accessibility Guidelines version 2.1 AA standard, due to the non-compliances listed below."),

      h2("Known issues"),
      block("We know the following issues exist. We are working to fix them:"),
      block("Map components: interactive maps (Leaflet/OpenStreetMap) may not be fully accessible via keyboard navigation or screen readers. Venue and listing addresses are always available as text alongside the map."),
      block("PDF documents: some council documents published as PDFs may not be fully accessible. If you need a document in an alternative format, contact us at office@langport.life."),
      block("Calendar view: the events calendar view has limited screen reader support. All events are also available in list view, which is fully accessible."),

      h2("How we tested this website"),
      block("This website was last tested for accessibility in July 2026. The test was carried out by Okapi & Co (okapiandco.co.uk), who developed the site."),

      h2("What we are doing to improve accessibility"),
      block("We are monitoring our content for accessibility issues and will prioritise fixes as they are identified. If you find a problem not listed here, please tell us using the contact details above."),
    ],
  });
  console.log("  ✓ /accessibility created");

  console.log("\n✅ Done. Three policy pages created:");
  console.log("   langport.life/privacy-policy");
  console.log("   langport.life/cookie-policy  (replaces old content)");
  console.log("   langport.life/accessibility");
}

run().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
