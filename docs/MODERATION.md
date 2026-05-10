# Moderating Events on Langport Life

This is the short version for **Morag** (`office@langport.life`).
Anyone can submit an event through the public form; nothing goes live on the website until you approve it here.

## How submissions reach you

1. A visitor fills in the form at **langport.life/submit/event** and clicks Submit.
2. Their submission is saved straight into the Sanity Studio with status **Pending Approval**.
3. You receive an email at `office@langport.life` titled **"[Langport Life] New event awaiting approval: <event title>"** with a one-click link to review it.
4. Pending events do **not** appear anywhere on the public website until you mark them Published.

## Approving (or rejecting) an event

1. Open the Studio at **langport.life/studio** (use the link from the email — it deep-links straight to the document).
2. The first item in the **Events** sidebar is **⚑ Pending Approval**. Click it to see everything waiting for you.
3. Open an event. Check that the title, date, venue, organiser, and description are sensible. Tidy the wording or add a venue reference if the submitter just typed a venue name.
4. Scroll down to the **Status** field and change it:
   - **Published** — the event will appear on the public Events page and calendar within a minute.
   - **Rejected** — the event will not appear publicly. The submitter is **not** automatically notified; if you want to reply, email them directly using the contact details on the document.
5. Click **Publish** at the bottom of the page. Done.

## What if I make a mistake?

- **Approved by accident** — open the event, change Status back to Pending Approval (or Cancelled), Publish.
- **Rejected by accident** — open the event, change Status to Pending Approval or Published, Publish. The document is never deleted by changing status.

## Recurring events

When someone submits a recurring event ("yoga every Tuesday", "monthly market"), it arrives as **one** document in the Pending Approval queue, not 52.

**Approving the document approves all occurrences for the next 12 months.** You don't need to approve each individual session.

The submitter sets:
- **Repeats**: Weekly / Every 2 weeks / Monthly / Yearly
- **Repeats until**: an end date (defaults to 1 year from start)

Behind the scenes Sanity stores this as an `RRULE` string in the Recurrence Rule field. You can edit it directly there if you need to tweak the pattern.

### Cancelling one date in a series

If, say, a yoga class is cancelled on a single Tuesday because of weather:

1. Open the recurring event document in Studio.
2. Find the **Excluded Dates** field.
3. Add the date that's cancelled (just the date, not the time).
4. Publish.

That date will disappear from the public site. Other Tuesdays continue as normal.

### Renewing an expiring series

Each recurring event has a "Recurrence End Date." A month before that date you'll get an automated email titled **"Recurring event '<name>' expires in 30 days"** with a link straight to the document.

To renew:
1. Open the document.
2. Update **Recurrence End Date** to a new date further out (e.g. another year).
3. Publish.

If you don't renew, the series stops appearing on the public site after the end date.

### What happens to past events

Events that are more than 30 days past their date are automatically deleted by a daily background job. You don't need to do anything — the listings keep themselves clean.

For recurring series, deletion only happens after the entire series's `recurrenceEndDate` is more than 30 days past.

## Other things you can do here

- The **Venues** and **Business Listings** sections also have their own pending queues, with the same approve/publish flow. You'll get the same kind of notification email.
- Use **All Events** to see absolutely everything including drafts and cancellations.

## Who to call if it breaks

- Email isn't arriving → check your Spam folder, then ping the website maintainer to confirm the Resend setup.
- Studio won't open → try a different browser, or hard-refresh (Ctrl+F5). If it still fails, ping the maintainer.
