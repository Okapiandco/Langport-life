import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Events")
        .schemaType("event")
        .child(S.documentTypeList("event").title("Events")),
      S.listItem()
        .title("Venues")
        .schemaType("venue")
        .child(S.documentTypeList("venue").title("Venues")),
      S.divider(),
      S.listItem()
        .title("Business Listings")
        .schemaType("businessListing")
        .child(
          S.documentTypeList("businessListing").title("Business Listings")
        ),
      S.listItem()
        .title("Listing Categories")
        .schemaType("listingCategory")
        .child(
          S.documentTypeList("listingCategory").title("Listing Categories")
        ),
      S.divider(),
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
      S.listItem()
        .title("Historic Sites")
        .schemaType("historicSite")
        .child(S.documentTypeList("historicSite").title("Historic Sites")),
      S.divider(),
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
      S.listItem()
        .title("Pages")
        .schemaType("page")
        .child(S.documentTypeList("page").title("Pages")),
      S.divider(),
      S.listItem()
        .title("Users")
        .schemaType("siteUser")
        .child(S.documentTypeList("siteUser").title("Users")),
    ]);
