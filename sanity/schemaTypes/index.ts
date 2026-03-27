import { event } from "./event";
import { venue } from "./venue";
import { businessListing } from "./businessListing";
import { councilMember } from "./councilMember";
import { councilDocument } from "./councilDocument";
import { historicSite } from "./historicSite";
import { page } from "./page";
import { article } from "./article";
import { listingCategory } from "./listingCategory";
import { articleCategory } from "./articleCategory";
import { siteSettings } from "./siteSettings";
import { navigation } from "./navigation";
import { activity } from "./activity";
import { transportOption } from "./transportOption";
import { submission } from "./submission";

export const schemaTypes = [
  // Singletons
  siteSettings,
  navigation,

  // Content
  event,
  venue,
  businessListing,
  listingCategory,
  activity,
  transportOption,
  article,
  articleCategory,
  historicSite,
  page,

  // Council
  councilMember,
  councilDocument,

  // Submissions (public form inbox)
  submission,
];
