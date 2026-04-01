import { groq } from "next-sanity";

// Events
export const allEventsQuery = groq`
  *[_type == "event" && status == "published"] | order(date asc) {
    _id, title, slug, date, endDate, eventType, isFree, tags,
    image { asset->{url}, alt },
    venue->{ _id, title, slug, town }
  }
`;

export const upcomingEventsQuery = groq`
  *[_type == "event" && status == "published" && date >= now()] | order(date asc) [0...$limit] {
    _id, title, slug, date, endDate, eventType, isFree, tags,
    image { asset->{url}, alt },
    venue->{ _id, title, slug, town }
  }
`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id, title, slug, description, date, endDate, eventType, isFree,
    tags, organiser, contactName, contactEmail, contactPhone,
    accessibilityInfo, maxAttendees, ticketsUrl, status,
    image { asset->{url}, alt },
    venue->{ _id, title, slug, street, town, postcode, coordinates, phone, email, website }
  }
`;

export const pendingEventsQuery = groq`
  *[_type == "event" && status == "pendingApproval"] | order(_createdAt desc) {
    _id, title, slug, date, eventType,
    venue->{ _id, title },
    submittedBy
  }
`;

// Venues
export const allVenuesQuery = groq`
  *[_type == "venue" && status == "active"] | order(title asc) {
    _id, title, slug, street, town, postcode, coordinates,
    capacity, facilities, tags,
    image { asset->{url}, alt }
  }
`;

export const venueBySlugQuery = groq`
  *[_type == "venue" && slug.current == $slug][0] {
    _id, title, slug, description, street, town, postcode, coordinates,
    phone, email, website, capacity, facilities, tags, status,
    image { asset->{url}, alt },
    images[] { asset->{url}, alt },
    "upcomingEvents": *[_type == "event" && references(^._id) && status == "published" && date >= now()] | order(date asc) {
      _id, title, slug, date, eventType, isFree,
      image { asset->{url}, alt }
    },
    "pastEvents": *[_type == "event" && references(^._id) && status == "published" && date < now()] | order(date desc) [0...6] {
      _id, title, slug, date, eventType, isFree,
      image { asset->{url}, alt }
    },
    "allEvents": *[_type == "event" && references(^._id) && status == "published"] | order(date desc) {
      _id, title, slug, date, eventType, isFree,
      image { asset->{url}, alt }
    }
  }
`;

// Business Listings
export const allListingsQuery = groq`
  *[_type == "businessListing" && status == "published"] | order(title asc) {
    _id, title, slug, street, town, postcode, coordinates, phone, tags,
    image { asset->{url}, alt },
    category->{ _id, name, slug, icon, color }
  }
`;

export const listingBySlugQuery = groq`
  *[_type == "businessListing" && slug.current == $slug][0] {
    _id, title, slug, description, street, town, postcode, coordinates,
    phone, email, website, tags, status,
    mondayOpen, mondayClose, tuesdayOpen, tuesdayClose,
    wednesdayOpen, wednesdayClose, thursdayOpen, thursdayClose,
    fridayOpen, fridayClose, saturdayOpen, saturdayClose,
    sundayOpen, sundayClose,
    image { asset->{url}, alt },
    images[] { asset->{url}, alt },
    category->{ _id, name, slug, icon, color }
  }
`;

export const listingCategoriesQuery = groq`
  *[_type == "listingCategory"] | order(name asc) {
    _id, name, slug, description, icon, color,
    "count": count(*[_type == "businessListing" && references(^._id) && status == "published"])
  }
`;

// Council Members
export const allCouncilMembersQuery = groq`
  *[_type == "councilMember" && !defined(endDate) && (councilLevel == "town" || !defined(councilLevel))] | order(name asc) {
    _id, name, slug, role, email, ward,
    image { asset->{url}, alt }
  }
`;

export const somersetCouncillorsQuery = groq`
  *[_type == "councilMember" && councilLevel in ["somerset", "district"] && !defined(endDate)] | order(name asc) {
    _id, name, slug, role, email, ward, councilLevel,
    image { asset->{url}, alt }
  }
`;

export const councilMemberBySlugQuery = groq`
  *[_type == "councilMember" && slug.current == $slug][0] {
    _id, name, slug, role, email, phone, biography, ward,
    startDate, endDate, socialLinks,
    image { asset->{url}, alt }
  }
`;

// Council Documents
export const allDocumentsQuery = groq`
  *[_type == "councilDocument" && visibility == "public"] | order(date desc) {
    _id, title, slug, documentType, date, meetingDate,
    file { asset->{url, originalFilename} }
  }
`;

export const documentsByTagQuery = groq`
  *[_type == "councilDocument" && visibility == "public" && $tag in tags] | order(date desc) {
    _id, title, slug, documentType, date, meetingDate, tags,
    file { asset->{url, originalFilename} }
  }
`;

export const documentTagCountsQuery = groq`{
  "full-council": count(*[_type == "councilDocument" && visibility == "public" && "full-council" in tags]),
  "finance-personnel": count(*[_type == "councilDocument" && visibility == "public" && "finance-personnel" in tags]),
  "tourism-marketing": count(*[_type == "councilDocument" && visibility == "public" && "tourism-marketing" in tags]),
  "annual-assembly": count(*[_type == "councilDocument" && visibility == "public" && "annual-assembly" in tags]),
  "joint-committee": count(*[_type == "councilDocument" && visibility == "public" && "joint-committee" in tags]),
  "archived": count(*[_type == "councilDocument" && visibility == "public" && "archived" in tags]),
  "governance": count(*[_type == "councilDocument" && visibility == "public" && "governance" in tags]),
  "finance": count(*[_type == "councilDocument" && visibility == "public" && "finance" in tags])
}`;

export const documentBySlugQuery = groq`
  *[_type == "councilDocument" && slug.current == $slug][0] {
    _id, title, slug, documentType, date, meetingDate, description,
    htmlContent, visibility, tags,
    file { asset->{url, originalFilename, size} }
  }
`;

// Historic Sites
export const allHistoricSitesQuery = groq`
  *[_type == "historicSite"] | order(title asc) {
    _id, title, slug, constructedYear, heritage, currentUse, openToPublic, address,
    image { asset->{url}, alt }
  }
`;

export const historicSiteBySlugQuery = groq`
  *[_type == "historicSite" && slug.current == $slug][0] {
    _id, title, slug, description, address, coordinates,
    constructedYear, heritage, historicalSignificance, currentUse, openToPublic,
    image { asset->{url}, alt },
    images[] { asset->{url}, alt }
  }
`;

// Pages
export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug && published == true][0] {
    _id, title, slug, description, content, seoDescription,
    image { asset->{url}, alt }
  }
`;

// Articles
export const allArticlesQuery = groq`
  *[_type == "article" && published == true] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt, author, tags,
    image { asset->{url}, alt },
    category->{ _id, name, slug }
  }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id, title, slug, content, excerpt, publishedAt, author, tags,
    image { asset->{url}, alt },
    category->{ _id, name, slug }
  }
`;

export const articleCategoriesQuery = groq`
  *[_type == "articleCategory"] | order(name asc) {
    _id, name, slug,
    "count": count(*[_type == "article" && references(^._id) && published == true])
  }
`;

// Search
export const searchQuery = groq`
  *[
    _type in ["event", "venue", "businessListing", "article", "page", "historicSite", "activity"] &&
    (title match $query || pt::text(description) match $query || pt::text(content) match $query) &&
    select(
      _type == "event" => status == "published",
      _type == "venue" => status == "active",
      _type == "businessListing" => status == "published",
      _type == "article" => published == true,
      _type == "page" => published == true,
      _type == "activity" => published == true,
      true
    )
  ] [0...20] {
    _id, _type, title, slug,
    "excerpt": coalesce(excerpt, pt::text(description)[0...150]),
    image { asset->{url}, alt },
    "heroImage": heroImage { asset->{url}, alt }
  }
`;

// ─── Site Settings ───
export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    siteName, tagline, seoDescription,
    logo { asset->{url}, alt },
    ogImage { asset->{url} },
    contactEmail, contactPhone, address,
    socialLinks,
    homepageHero {
      heading, subheading,
      image { asset->{url} }
    },
    homepageCards[] {
      title, href, color,
      image { asset->{url} }
    },
    didYouKnow,
    footerText,
    emergencyContacts[] { name, phone, url, description }
  }
`;

// ─── Navigation ───
export const navigationQuery = groq`
  *[_type == "navigation"][0] {
    mainMenu[] {
      title, href,
      children[] {
        groupTitle,
        links[] { title, href, description }
      },
      cards[] {
        title, description, href,
        image { asset->{url} }
      }
    },
    footerColumns[] {
      title,
      links[] { title, href }
    }
  }
`;

// ─── Activities (Things To Do) ───
export const allActivitiesQuery = groq`
  *[_type == "activity" && published == true] | order(category asc, order asc) {
    _id, title, slug, category, excerpt, distance, difficulty,
    heroImage { asset->{url}, alt }
  }
`;

export const activitiesByCategoryQuery = groq`
  *[_type == "activity" && published == true && category == $category] | order(order asc) {
    _id, title, slug, excerpt, distance, difficulty,
    heroImage { asset->{url}, alt }
  }
`;

export const activityBySlugQuery = groq`
  *[_type == "activity" && slug.current == $slug && published == true][0] {
    _id, title, slug, category, excerpt, distance, duration, difficulty,
    heroImage { asset->{url}, alt },
    content[] {
      ...,
      _type == "image" => { asset->{url}, alt, caption }
    },
    routeMapImage { asset->{url}, alt },
    gallery[] { asset->{url}, alt, caption },
    highlights,
    notices[] { type, title, text },
    externalLinks[] { title, url, description },
    youtubeUrl
  }
`;

// ─── Transport (Getting Here) ───
export const allTransportQuery = groq`
  *[_type == "transportOption"] | order(type asc, order asc) {
    _id, title, type, distance, railLine, journeyNotes,
    routeNumber, operator, routeDescription, frequency,
    postcode, isFree, description, coordinates, website, order
  }
`;

export const transportByTypeQuery = groq`
  *[_type == "transportOption" && type == $type] | order(order asc) {
    _id, title, type, distance, railLine, journeyNotes,
    routeNumber, operator, routeDescription, frequency,
    postcode, isFree, description, coordinates, website
  }
`;

// Homepage
export const homepageQuery = groq`{
  "featuredEvent": coalesce(
    *[_type == "event" && status == "published" && date >= now()] | order(date asc) [0],
    *[_type == "event" && status == "published"] | order(date desc) [0]
  ) {
    _id, title, slug, date, endDate, eventType, isFree, tags,
    "excerpt": pt::text(description)[0...200],
    image { asset->{url}, alt },
    venue->{ title, town }
  },
  "upcomingEvents": *[_type == "event" && status == "published" && date >= now()] | order(date asc) [0...6] {
    _id, title, slug, date, eventType, isFree,
    image { asset->{url}, alt },
    venue->{ title }
  },
  "latestArticles": *[_type == "article" && published == true] | order(publishedAt desc) [0...3] {
    _id, title, slug, excerpt, publishedAt,
    image { asset->{url}, alt },
    category->{ name }
  },
  "historicSites": *[_type == "historicSite"] | order(title asc) [0...4] {
    _id, title, slug, constructedYear, heritage,
    image { asset->{url}, alt }
  },
  "venueCount": count(*[_type == "venue" && status == "active"]),
  "eventCount": count(*[_type == "event" && status == "published" && date >= now()]),
  "listingCount": count(*[_type == "businessListing" && status == "published"]),
  "siteCount": count(*[_type == "historicSite"])
}`;
