import type { ReactNode } from "react";
import { Badge, Box, Card, Container, Flex, Heading, Stack, Text } from "@sanity/ui";

// Plain-English how-to guide for council staff. Static content, no data access.
// Update this file whenever the workflow changes so the guide stays true.

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card padding={4} radius={2} border>
      <Stack space={3}>
        <Flex align="center" gap={3}>
          <Badge tone="primary" fontSize={1}>
            {number}
          </Badge>
          <Heading as="h2" size={1}>
            {title}
          </Heading>
        </Flex>
        {children}
      </Stack>
    </Card>
  );
}

function P({ children }: { children: ReactNode }) {
  return (
    <Text size={1} style={{ lineHeight: 1.7 }}>
      {children}
    </Text>
  );
}

function Step({ children }: { children: ReactNode }) {
  return (
    <Flex gap={2} align="flex-start">
      <Text size={1}>•</Text>
      <Text size={1} style={{ lineHeight: 1.7 }}>
        {children}
      </Text>
    </Flex>
  );
}

export function HelpTool() {
  return (
    <Container width={1} padding={4}>
      <Stack space={4}>
        <Heading as="h1" size={3}>
          How to manage langport.life
        </Heading>
        <P>
          Everything on the website is managed from here. Changes you publish
          appear on the live site automatically, usually within a few minutes.
          If something looks stuck after an hour, or anything in this guide
          doesn&apos;t match what you see, contact Jim at Okapi &amp; Co
          (jim@okapiandco.co.uk).
        </P>

        <Section number="1" title="Uploading meeting documents (the quick way)">
          <P>
            Use the <strong>Bulk Upload</strong> tab (top of the screen) whenever
            you have a meeting&apos;s papers to publish — agenda, minutes and all
            supporting documents in one go.
          </P>
          <Stack space={2}>
            <Step>Open Bulk Upload and choose the committee from the dropdown.</Step>
            <Step>Set the meeting date.</Step>
            <Step>
              Drag all the files into the dashed box (or click it and select
              several at once). PDF, Word and Excel files all work.
            </Step>
            <Step>
              Check the list: each file gets a title from its filename and a
              guessed type (Agenda, Minutes, Financial Report…). Fix any title
              or type before uploading — click in the box and edit.
            </Step>
            <Step>
              Press <strong>Upload</strong>. Each row shows Published when done.
              The documents appear on the website under that committee, grouped
              by month.
            </Step>
          </Stack>
          <P>
            <strong>Confidential papers:</strong> switch Visibility to
            &quot;Clerk only&quot; before uploading and those documents will
            never appear on the public website.
          </P>
        </Section>

        <Section number="2" title="Adding or editing a single document">
          <P>
            For one-off documents (a policy, a notice), go to{" "}
            <strong>Structure → Council → Documents → All Documents</strong> and
            click the compose (pencil) icon. Fill in the title, generate the
            slug (click Generate next to the slug field), choose the type and
            date, upload the file, tick the committee under Tags, then press{" "}
            <strong>Publish</strong>. A document is not on the website until it
            is published.
          </P>
          <P>
            To replace a file (for example draft minutes with approved minutes),
            open the existing document, upload the new file over the old one,
            and publish again — the website link stays the same.
          </P>
        </Section>

        <Section number="3" title="Changing the order documents appear in">
          <P>
            Go to <strong>Structure → Council → Documents → By Committee</strong>{" "}
            and pick a committee. Drag documents up and down with the handle on
            the left — the website shows them in exactly this order within each
            month. The menu in the top-right of the list also has{" "}
            <strong>Reset order</strong> if things get muddled.
          </P>
        </Section>

        <Section number="4" title="Approving events and listings from the public">
          <P>
            Residents and businesses can submit events, venues, business
            listings and community groups through the website. Nothing they
            submit goes live until you approve it.
          </P>
          <Stack space={2}>
            <Step>
              Open the <strong>Approvals</strong> tab (top of the screen). New
              submissions appear there with who sent them.
            </Step>
            <Step>
              Click a submission to read it, then use <strong>Approve</strong>{" "}
              or <strong>Reject</strong>. Approving publishes it to the site;
              you also get an email when new submissions arrive.
            </Step>
            <Step>
              Submitters receive an edit link by email. If they change a
              published item, it comes back to Approvals for you to re-approve.
            </Step>
          </Stack>
        </Section>

        <Section number="5" title="News articles">
          <P>
            <strong>Structure → Articles &amp; News → All Articles</strong>.
            Create an article with a title, category, a short excerpt (this
            shows in previews and search results), an image and the story
            itself. Tick <strong>Published</strong> and press Publish. Newest
            articles appear first on the Town News page.
          </P>
        </Section>

        <Section number="6" title="Events, venues, groups and listings">
          <P>
            You can add these directly too (not just via public submissions):{" "}
            <strong>Structure → Events / Venues / Business Listings / Groups</strong>.
            For events set the date and time carefully — recurring events (weekly
            classes, markets) have a repeat rule so one entry covers every
            occurrence. Past one-off events are tidied away automatically 30
            days after they finish.
          </P>
        </Section>

        <Section number="7" title="Councillors and staff">
          <P>
            <strong>Structure → Council → Members</strong> for councillors and{" "}
            <strong>Council → Staff</strong> for staff and volunteers. To
            record that someone has stood down, set their end date rather than
            deleting them. Staff display order is set with the Display Order
            number — lower numbers appear first.
          </P>
        </Section>

        <Section number="8" title="General pages and site settings">
          <P>
            Standalone pages (About, policies and so on) live under{" "}
            <strong>Structure → Pages</strong>. The homepage cards, welcome
            text, contact details, footer and &quot;Did you know&quot; fact are
            all in <strong>Structure → Site Settings</strong>. The menus are in{" "}
            <strong>Structure → Navigation</strong> — be careful here, as a
            wrong link affects every page.
          </P>
        </Section>

        <Section number="9" title="Good habits">
          <Stack space={2}>
            <Step>
              Give documents clear titles — they become the link text people
              see and what search engines index.
            </Step>
            <Step>
              Publish is what makes things live. A saved draft (grey dot) is
              not on the website yet.
            </Step>
            <Step>
              Never delete a published document to &quot;hide&quot; it — set
              Visibility to Clerk only instead, so the record is kept.
            </Step>
            <Step>
              If you make a mistake, don&apos;t panic: every document keeps its
              history (the Review changes clock icon) and can be restored.
            </Step>
          </Stack>
        </Section>

        <Box paddingBottom={5}>
          <Text size={1} muted>
            Site built and supported by Okapi &amp; Co — jim@okapiandco.co.uk.
            This guide lives in the Studio, so it&apos;s always to hand; if the
            site changes, the guide will be updated with it.
          </Text>
        </Box>
      </Stack>
    </Container>
  );
}
