import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Content Standards & Guidelines | Guides",
  description: "What makes a good listing on Langport Life — guidance on titles, descriptions, photos, and what to include for events, businesses, venues, and community groups.",
};

function FieldRow({ required, name, detail }: { required: "Required" | "Recommended" | "Optional" | "If recurring" | "If ticketed"; name: string; detail: string }) {
  const colour =
    required === "Required" ? "text-primary bg-primary/10" :
    required === "Recommended" ? "text-amber-700 bg-amber-50" :
    "text-gray-500 bg-gray-100";
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <span className={`flex-shrink-0 rounded px-2 py-0.5 text-xs font-semibold self-start mt-0.5 whitespace-nowrap ${colour}`}>
        {required}
      </span>
      <div>
        <p className="font-medium text-gray-900 text-sm mb-0.5">{name}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

function Example({ type, label, text, reason }: { type: "good" | "bad"; label: string; text: string; reason: string }) {
  const styles = type === "good"
    ? "border-green-300 bg-green-50 text-green-800"
    : "border-red-200 bg-red-50 text-red-800";
  return (
    <div className={`rounded-lg border p-4 ${styles}`}>
      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${type === "good" ? "text-green-700" : "text-red-600"}`}>
        {type === "good" ? "✓" : "✗"} {label}
      </p>
      <p className="font-mono text-xs leading-relaxed mb-2">{text}</p>
      <p className="text-xs italic opacity-75">{reason}</p>
    </div>
  );
}

export default function SubmissionGuidelinesPage() {
  return (
    <>
      <PageHero
        section="things-to-do"
        title="Content Standards & Guidelines"
        subtitle="What makes a good listing — and how to write one that gets approved quickly and works well for visitors."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: "Content Guidelines" },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-14">

        {/* General principles */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">General Principles</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { head: "Be specific", body: "Vague titles and descriptions get passed over. Tell people exactly what it is, where, and why they should come." },
              { head: "Write for residents", body: "Assume your reader is a local who wants to know if this is for them. Skip marketing language and jargon." },
              { head: "Include contact details", body: "Always add a phone number, email, or website — people need a way to follow up or book." },
              { head: "Add a photo", body: "Listings with photos get far more engagement. A well-lit phone photo is better than none." },
            ].map(({ head, body }) => (
              <div key={head} className="rounded-xl border border-gray-200 border-t-2 border-t-primary bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{head}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-r-lg border-l-4 border-primary bg-primary/5 px-5 py-4 text-sm text-gray-700">
            <strong className="text-primary">Moderation note:</strong> We review every submission before it goes live. We may make minor formatting edits but won&rsquo;t change your content. Approval usually takes 1–2 working days.
          </div>
        </section>

        {/* Events */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Events</h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden mb-5">
            <FieldRow required="Required" name="Title" detail="Short and clear — include the event name and what it is. Avoid ALL CAPS. Don't start with 'A' or 'The'." />
            <FieldRow required="Required" name="Date & Time" detail="Start date and time are required. Always add an end time — people need to plan around it. Use 15-minute increments." />
            <FieldRow required="Required" name="Description" detail="2–4 sentences minimum. What happens at the event, who it's for, and what people should bring or expect. No HTML or asterisks." />
            <FieldRow required="Recommended" name="Event Type" detail="Choose the most accurate type: Social, Class, Workshop, Market, Performance, Meeting, or Other. This drives the filter on the What's On page." />
            <FieldRow required="Recommended" name="Venue" detail="Select the venue from the list if it's registered, or type the name. Don't leave this blank — people need to know where to go." />
            <FieldRow required="If recurring" name="Repeat / Frequency" detail="If your event runs weekly, fortnightly, or monthly, tick the repeat option and choose the frequency. Submit once — the site shows all upcoming dates." />
            <FieldRow required="If ticketed" name="Tickets URL" detail="Paste the direct booking link. Leave blank for free or pay-on-the-door events and tick 'Free entry' instead." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Example type="good" label="Good title" text="Langport Farmers Market" reason="Clear, specific, no filler words." />
            <Example type="bad" label="Avoid" text="COME TO OUR AMAZING EVENT!!" reason="Caps and exclamation marks will be edited out." />
            <Example type="good" label="Good description" text="A weekly yoga class for beginners and improvers held at the Town Hall. Bring a mat if you have one — a few are available to borrow. £7 per session, no booking needed." reason="Covers what, who, where, cost, and practicalities." />
            <Example type="bad" label="Avoid" text="Join us for a great time. Everyone welcome. See you there!" reason="No useful information — people can't tell if it's relevant to them." />
          </div>
        </section>

        {/* Community Groups */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Community Groups</h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden mb-4">
            <FieldRow required="Required" name="Group Name" detail="The official name of the group. Don't include 'Langport' unless it's part of the name." />
            <FieldRow required="Required" name="Description" detail="What the group does, who it's for, and what someone can expect if they join. Include whether new members are welcome." />
            <FieldRow required="Required" name="Where you meet" detail="The venue name and room if relevant (e.g. 'Langport Town Hall, main hall'). Be specific enough that someone new can find you." />
            <FieldRow required="Required" name="When you meet" detail="Day, time, and frequency in plain English (e.g. 'Every Wednesday, 7–9pm'). Write it as you would tell a friend." />
            <FieldRow required="Recommended" name="Cost" detail="Be upfront — 'Free', '£3 per session', 'Annual membership £20'. People want to know before they turn up." />
            <FieldRow required="Recommended" name="Contact Details" detail="At minimum, an email address. People need a way to ask questions before attending for the first time." />
          </div>
          <div className="rounded-r-lg border-l-4 border-primary bg-primary/5 px-5 py-4 text-sm text-gray-700">
            <strong className="text-primary">Tip:</strong> Once your group is listed, ask the team to link it to a recurring calendar event. Your upcoming meeting dates will then appear on the What&rsquo;s On calendar automatically.
          </div>
        </section>

        {/* Business Listings */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Business Listings</h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden mb-5">
            <FieldRow required="Required" name="Business Name" detail="Your trading name as you'd like it to appear. Don't add your category or location to the title." />
            <FieldRow required="Required" name="Description" detail="2–5 sentences about what you do, what makes you different, and who your customers are. Write in plain English — imagine explaining it to a neighbour." />
            <FieldRow required="Required" name="Address" detail="Your street address and postcode. This places you on the map — make sure it's accurate." />
            <FieldRow required="Recommended" name="Phone & Email" detail="At least one contact method. Don't include a contact if it isn't monitored regularly." />
            <FieldRow required="Recommended" name="Website" detail="Your website URL, Facebook page, or Instagram profile. Paste the full URL including https://" />
            <FieldRow required="Optional" name="Opening Hours" detail="Fill in each day separately. Leave blank any days you're closed. Residents use this to plan visits." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Example type="good" label="Good description" text="Family-run hardware store on Bow Street, open since 1987. We stock tools, fixings, paints, and garden supplies — and we actually know what everything is for. Monday to Saturday, 8am–5pm." reason="Specific, personal, informative. Tells you what, where, and when." />
            <Example type="bad" label="Avoid" text="We are a premier provider of cutting-edge solutions for all your hardware needs. Visit us today for an unparalleled customer experience!" reason="Corporate filler that tells you nothing — write for people, not search engines." />
          </div>
        </section>

        {/* Photos */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Photos</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { head: "Size", body: "At least 800px wide. Landscape (wider than tall) works best on the site." },
              { head: "Subject", body: "Show the real thing — your venue, your stall, your group in action. Not a logo or poster." },
              { head: "Lighting", body: "Natural daylight is ideal. Avoid flash photos with harsh shadows or very dark images." },
              { head: "Format", body: "JPG or PNG. Don't upload screenshots of social media posts — use the original photo." },
              { head: "Copyright", body: "Only upload photos you own or have permission to use. Don't use stock images." },
              { head: "People", body: "If your photo includes identifiable people, make sure they're happy to appear on a public website." },
            ].map(({ head, body }) => (
              <div key={head} className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5">{head}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <Link href="/guides/how-to-list" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary/90 transition">
            How to submit a listing →
          </Link>
          <Link href="/guides" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50 transition">
            Back to Guides
          </Link>
        </div>

      </div>
    </>
  );
}
