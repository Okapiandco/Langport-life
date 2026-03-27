import type { StructureResolver } from "sanity/structure";

// Singleton helper — shows a single document editor with no list
const singletonItem = (
  S: Parameters<StructureResolver>[0],
  typeName: string,
  title: string,
  documentId: string
) =>
  S.listItem()
    .title(title)
    .id(documentId)
    .child(
      S.document().schemaType(typeName).documentId(documentId).title(title)
    );

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Langport Life")
    .items([
      // ─── Singletons ───
      singletonItem(S, "siteSettings", "Site Settings", "siteSettings"),
      singletonItem(S, "navigation", "Navigation", "navigation"),
      S.divider(),

      // ─── Submissions Inbox ───
      S.listItem()
        .title("Submissions Inbox")
        .child(
          S.list()
            .title("Submissions")
            .items([
              S.listItem()
                .title("Pending Review")
                .child(
                  S.documentTypeList("submission")
                    .title("Pending Submissions")
                    .filter('_type == "submission" && status == "pending"')
                ),
              S.listItem()
                .title("Approved")
                .child(
                  S.documentTypeList("submission")
                    .title("Approved Submissions")
                    .filter('_type == "submission" && status == "approved"')
                ),
              S.listItem()
                .title("Rejected")
                .child(
                  S.documentTypeList("submission")
                    .title("Rejected Submissions")
                    .filter('_type == "submission" && status == "rejected"')
                ),
              S.divider(),
              S.listItem()
                .title("All Submissions")
                .schemaType("submission")
                .child(
                  S.documentTypeList("submission").title("All Submissions")
                ),
            ])
        ),
      S.divider(),

      // ─── Events ───
      S.listItem()
        .title("Events")
        .child(
          S.list()
            .title("Events")
            .items([
              S.listItem()
                .title("Published Events")
                .child(
                  S.documentTypeList("event")
                    .title("Published Events")
                    .filter('_type == "event" && status == "published"')
                ),
              S.listItem()
                .title("Pending Approval")
                .child(
                  S.documentTypeList("event")
                    .title("Pending Events")
                    .filter('_type == "event" && status == "pendingApproval"')
                ),
              S.listItem()
                .title("Drafts & Cancelled")
                .child(
                  S.documentTypeList("event")
                    .title("Drafts & Cancelled")
                    .filter(
                      '_type == "event" && status in ["draft", "cancelled", "rejected"]'
                    )
                ),
              S.divider(),
              S.listItem()
                .title("All Events")
                .schemaType("event")
                .child(S.documentTypeList("event").title("All Events")),
            ])
        ),

      // ─── Venues ───
      S.listItem()
        .title("Venues")
        .schemaType("venue")
        .child(S.documentTypeList("venue").title("Venues")),

      S.divider(),

      // ─── Business Listings ───
      S.listItem()
        .title("Business Listings")
        .child(
          S.list()
            .title("Business Listings")
            .items([
              S.listItem()
                .title("Published")
                .child(
                  S.documentTypeList("businessListing")
                    .title("Published Listings")
                    .filter(
                      '_type == "businessListing" && status == "published"'
                    )
                ),
              S.listItem()
                .title("Pending Approval")
                .child(
                  S.documentTypeList("businessListing")
                    .title("Pending Listings")
                    .filter(
                      '_type == "businessListing" && status == "pendingApproval"'
                    )
                ),
              S.divider(),
              S.listItem()
                .title("All Listings")
                .schemaType("businessListing")
                .child(
                  S.documentTypeList("businessListing").title("All Listings")
                ),
              S.listItem()
                .title("Categories")
                .schemaType("listingCategory")
                .child(
                  S.documentTypeList("listingCategory").title("Categories")
                ),
            ])
        ),

      S.divider(),

      // ─── Things To Do ───
      S.listItem()
        .title("Things To Do")
        .child(
          S.list()
            .title("Activities")
            .items([
              S.listItem()
                .title("Exploring the Wild")
                .child(
                  S.documentTypeList("activity")
                    .title("Exploring the Wild")
                    .filter(
                      '_type == "activity" && category == "exploring"'
                    )
                ),
              S.listItem()
                .title("Walking & Cycling")
                .child(
                  S.documentTypeList("activity")
                    .title("Walking & Cycling")
                    .filter(
                      '_type == "activity" && category == "walking-cycling"'
                    )
                ),
              S.listItem()
                .title("The Outdoor Life")
                .child(
                  S.documentTypeList("activity")
                    .title("The Outdoor Life")
                    .filter(
                      '_type == "activity" && category == "outdoor"'
                    )
                ),
              S.divider(),
              S.listItem()
                .title("All Activities")
                .schemaType("activity")
                .child(S.documentTypeList("activity").title("All Activities")),
            ])
        ),

      // ─── Getting Here ───
      S.listItem()
        .title("Getting Here")
        .child(
          S.list()
            .title("Transport Options")
            .items([
              S.listItem()
                .title("Train Stations")
                .child(
                  S.documentTypeList("transportOption")
                    .title("Train Stations")
                    .filter(
                      '_type == "transportOption" && type == "train"'
                    )
                ),
              S.listItem()
                .title("Bus Routes")
                .child(
                  S.documentTypeList("transportOption")
                    .title("Bus Routes")
                    .filter(
                      '_type == "transportOption" && type == "bus"'
                    )
                ),
              S.listItem()
                .title("Parking")
                .child(
                  S.documentTypeList("transportOption")
                    .title("Parking")
                    .filter(
                      '_type == "transportOption" && type == "parking"'
                    )
                ),
              S.listItem()
                .title("Cycling")
                .child(
                  S.documentTypeList("transportOption")
                    .title("Cycling")
                    .filter(
                      '_type == "transportOption" && type == "cycling"'
                    )
                ),
              S.divider(),
              S.listItem()
                .title("All Transport")
                .schemaType("transportOption")
                .child(
                  S.documentTypeList("transportOption").title("All Transport")
                ),
            ])
        ),

      S.divider(),

      // ─── Council ───
      S.listItem()
        .title("Council")
        .child(
          S.list()
            .title("Council")
            .items([
              S.listItem()
                .title("Members")
                .schemaType("councilMember")
                .child(
                  S.documentTypeList("councilMember").title("Council Members")
                ),
              S.listItem()
                .title("Documents")
                .schemaType("councilDocument")
                .child(
                  S.documentTypeList("councilDocument").title(
                    "Council Documents"
                  )
                ),
            ])
        ),

      S.divider(),

      // ─── Articles & News ───
      S.listItem()
        .title("Articles & News")
        .child(
          S.list()
            .title("Articles & News")
            .items([
              S.listItem()
                .title("All Articles")
                .schemaType("article")
                .child(S.documentTypeList("article").title("Articles")),
              S.listItem()
                .title("Categories")
                .schemaType("articleCategory")
                .child(
                  S.documentTypeList("articleCategory").title(
                    "Article Categories"
                  )
                ),
            ])
        ),

      // ─── Historic Sites ───
      S.listItem()
        .title("Historic Sites")
        .schemaType("historicSite")
        .child(S.documentTypeList("historicSite").title("Historic Sites")),

      // ─── Pages ───
      S.listItem()
        .title("Pages")
        .schemaType("page")
        .child(S.documentTypeList("page").title("Pages")),
    ]);
