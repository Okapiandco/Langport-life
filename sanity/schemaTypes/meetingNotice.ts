import { defineField, defineType } from "sanity";
import { COMMITTEES } from "../../lib/committees";

const NOTICE_LABELS: Record<string, string> = {
  rearranged: "Meeting rearranged",
  cancelled: "Meeting cancelled",
  note: "Note",
};

/**
 * A note pinned to a committee's month folder on the public site, e.g.
 * "Meeting rearranged to Tuesday 22 September at 7pm". The folder is chosen
 * by the originally scheduled meeting date, so the note sits alongside that
 * meeting's papers.
 */
export const meetingNotice = defineType({
  name: "meetingNotice",
  title: "Meeting Notice",
  type: "document",
  fields: [
    defineField({
      name: "committee",
      title: "Committee",
      type: "string",
      options: {
        list: COMMITTEES.filter((c) => c.tag !== "archived").map((c) => ({
          title: c.shortName,
          value: c.tag,
        })),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "originalDate",
      title: "Original meeting date",
      type: "date",
      options: { dateFormat: "DD/MM/YYYY" },
      description:
        "The date the meeting was first scheduled for. The note appears on that month's folder (e.g. September 2026).",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "noticeType",
      title: "Type of notice",
      type: "string",
      options: {
        list: Object.entries(NOTICE_LABELS).map(([value, title]) => ({ title, value })),
        layout: "radio",
      },
      initialValue: "rearranged",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "newDateTime",
      title: "New date and time",
      type: "datetime",
      options: { dateFormat: "DD/MM/YYYY", timeFormat: "HH:mm", timeStep: 15 },
      hidden: ({ parent }) => parent?.noticeType !== "rearranged",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { noticeType?: string } | undefined;
          return parent?.noticeType === "rearranged" && !value
            ? "Add the new date and time"
            : true;
        }),
    }),
    defineField({
      name: "message",
      title: "Message (optional)",
      type: "text",
      rows: 3,
      description: "Any extra detail, e.g. a change of venue. Shown under the headline.",
    }),
  ],
  orderings: [
    {
      title: "Meeting date, newest",
      name: "originalDateDesc",
      by: [{ field: "originalDate", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      committee: "committee",
      noticeType: "noticeType",
      originalDate: "originalDate",
    },
    prepare({ committee, noticeType, originalDate }) {
      const name = COMMITTEES.find((c) => c.tag === committee)?.shortName ?? committee;
      const date = originalDate
        ? new Date(`${originalDate}T12:00:00`).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "No date";
      return {
        title: `${NOTICE_LABELS[noticeType] ?? "Notice"}: ${name ?? ""}`,
        subtitle: `Originally ${date}`,
      };
    },
  },
});
