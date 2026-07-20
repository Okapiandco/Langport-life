import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "How to Submit, Edit & Claim a Listing | Guides",
  description: "Step-by-step guide to adding your event, business, venue, or community group to Langport Life, and how to edit or claim an existing listing.",
};

function Step({ n, title, detail }: { n: number; title: string; detail: string }) {
  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-heading text-sm font-bold">
        {n}
      </div>
      <div>
        <p className="font-medium text-gray-900 mb-0.5">{title}</p>
        <p className="text-sm text-gray-600 leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}

function TypeCard({ name, fields }: { name: string; fields: string[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-bold uppercase tracking-wider text-primary mb-3">{name}</p>
      <ul className="space-y-1.5">
        {fields.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300" />
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HowToListPage() {
  return (
    <>
      <PageHero
        section="things-to-do"
        title="How to Submit, Edit & Claim a Listing"
        subtitle="Everything is submitted by the community and reviewed before it goes live. Here's how the process works."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: "How to List" },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-14">

        {/* Section 1 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            1. Submitting a new listing
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden mb-4">
            <Step n={1} title="Choose the right form" detail="Go to langport.life and find the relevant page. There are separate submission forms for Events, Venues, Business Listings, and Community Groups — use the Submit links in the navigation." />
            <Step n={2} title="Fill in your details" detail="Complete the form with your information — title, description, contact details, dates (for events), address (for venues and businesses), and a photo. The more you fill in, the better your listing will look." />
            <Step n={3} title="Save your confirmation email" detail="After submitting you'll receive a confirmation email with a personal edit link. Bookmark or save this email — it's the only way to update your listing without contacting us, and it doesn't expire." />
            <Step n={4} title="We review and publish" detail="Our team reviews every submission before it goes live — usually within a day or two. Once approved, your listing appears on the site immediately." />
          </div>
          <div className="rounded-r-lg border-l-4 border-primary bg-primary/5 px-5 py-4 text-sm text-gray-700">
            <strong className="text-primary">Recurring events:</strong> If your event repeats weekly, fortnightly, monthly, or annually, tick the repeat option on the submission form. You only need to submit once — the site shows all upcoming dates automatically.
          </div>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            2. What you can submit
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <TypeCard name="Events" fields={["One-off or recurring", "Date, time, venue", "Free or ticketed", "Photo & description", "Organiser & contact"]} />
            <TypeCard name="Businesses" fields={["Name & description", "Address & map pin", "Phone, email, website", "Opening hours", "Photo"]} />
            <TypeCard name="Venues" fields={["Name & description", "Address & map pin", "Contact details", "Facilities", "Photo"]} />
            <TypeCard name="Groups" fields={["Group name & about", "Where & when you meet", "Cost to join", "Organiser & contact", "Photo"]} />
          </div>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            3. Updating an existing listing
          </h2>
          <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 overflow-hidden mb-4">
            <Step n={1} title="Find your personal edit link" detail="It was in the confirmation email you received when you submitted. Search your inbox for an email from noreply@langport.life." />
            <Step n={2} title="Open the link and make your changes" detail="The link takes you to an edit form pre-filled with your current details. Change whatever needs updating and click Save." />
            <Step n={3} title="Quick re-review" detail="If your listing was already live, saving your changes sends it back for a brief re-check before re-publishing. This usually takes less than a day." />
          </div>
          <div className="rounded-r-lg border-l-4 border-amber-400 bg-amber-50 px-5 py-4 text-sm text-gray-700">
            <strong className="text-amber-700">Lost your link?</strong> Email <a href="mailto:office@langport.life" className="text-primary hover:underline">office@langport.life</a> with your name and the listing title and we&rsquo;ll resend it.
          </div>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-4">
            4. Claiming an existing listing
          </h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Some listings were added by our team from public information before the self-serve system launched. If you own the business or run the group, you can take over management of it.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Email <a href="mailto:office@langport.life" className="text-primary hover:underline font-medium">office@langport.life</a> with your name, the listing name, and a way to verify you&rsquo;re the owner (e.g. an email from the business domain, or a link to your Facebook page). We&rsquo;ll send you a personal edit link within a day or two.
          </p>
        </section>

        {/* Section 5 — editable table */}
        <section>
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
            5. What you can change yourself
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold border-b border-gray-200">Field</th>
                  <th className="px-5 py-3 text-left font-semibold border-b border-gray-200">Via your edit link</th>
                  <th className="px-5 py-3 text-left font-semibold border-b border-gray-200">Admin only</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {[
                  ["Title, description, photo", "✓ All listing types", ""],
                  ["Event dates & repeat pattern", "✓ Events", ""],
                  ["Venue, organiser, tickets link", "✓ Events", ""],
                  ["Address, phone, email, website", "✓ Businesses & Venues", ""],
                  ["Where & when you meet, cost", "✓ Groups", ""],
                  ["Contact details", "✓ All listing types", ""],
                  ["Publish / unpublish / cancel", "", "Admin team"],
                  ["URL / slug changes", "", "Admin team"],
                  ["Deleting a listing", "", "Admin team"],
                ].map(([field, self, admin]) => (
                  <tr key={field}>
                    <td className="px-5 py-3 text-gray-700">{field}</td>
                    <td className="px-5 py-3 font-medium text-primary">{self}</td>
                    <td className="px-5 py-3 text-gray-400">{admin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Footer CTA */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
          <Link href="/guides/submission-guidelines" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline hover:bg-primary/90 transition">
            Read the content guidelines →
          </Link>
          <Link href="/guides" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 no-underline hover:bg-gray-50 transition">
            Back to Guides
          </Link>
        </div>

      </div>
    </>
  );
}
