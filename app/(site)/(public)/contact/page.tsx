import type { Metadata } from "next";
import { client } from "@/lib/sanity";
import { siteSettingsQuery } from "@/lib/queries";
import PageHero from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Langport Town Council team.",
};

export default async function ContactPage() {
  const settings = await client.fetch(siteSettingsQuery).catch(() => null);

  const phone = settings?.contactPhone || "01458 259700";
  const email = settings?.contactEmail || "office@langport.life";
  const address = settings?.address || null;

  return (
    <>
      <PageHero
        section="about"
        title="Contact Us"
        subtitle="Get in touch with the Langport Town Council team."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact" },
        ]}
      />

      <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-gray-700 leading-relaxed">
          Have a question, suggestion, or something to share with the council? Send us a
          message using the form below and we&apos;ll get back to you as soon as we can.
        </p>

        <ContactForm />

        <div className="mt-16 border-t border-gray-200 pt-8">
          <h2 className="font-heading text-xl font-bold text-gray-900">Langport Town Council</h2>
          <dl className="mt-4 space-y-2 text-sm text-gray-700">
            {address && (
              <div>
                <dt className="font-medium text-gray-900">Address</dt>
                <dd>{address}</dd>
              </div>
            )}
            <div>
              <dt className="font-medium text-gray-900">Phone</dt>
              <dd>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Email</dt>
              <dd>
                <a href={`mailto:${email}`} className="hover:text-primary">
                  {email}
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
