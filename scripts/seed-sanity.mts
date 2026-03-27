/**
 * Seed script — populates Sanity with all the content that was previously hardcoded.
 * Run with: npx tsx scripts/seed-sanity.ts
 */
import { createClient } from "next-sanity";

const client = createClient({
  projectId: "8ecf405k",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

function block(text: string) {
  return {
    _type: "block",
    _key: Math.random().toString(36).slice(2, 10),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span", _key: Math.random().toString(36).slice(2, 10), text, marks: [] }],
  };
}

async function seed() {
  console.log("🌱 Seeding Sanity...\n");

  // ─── 1. Site Settings ───
  console.log("📋 Creating Site Settings...");
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteName: "Langport Life",
    tagline: "Community Hub for Langport, Somerset",
    seoDescription: "Your community hub for events, venues, businesses, and council information in Langport, Somerset.",
    contactEmail: "clerk@langport.life",
    socialLinks: {
      facebook: "https://www.facebook.com/langportlife/",
      twitter: "https://x.com/LangportLife",
    },
    homepageCards: [
      { _key: "c1", title: "What's on", href: "/events", color: "primary" },
      { _key: "c2", title: "Things to do", href: "/things-to-do", color: "copper" },
      { _key: "c3", title: "Shops & Services", href: "/listings", color: "light-blue" },
      { _key: "c4", title: "History", href: "/history", color: "green" },
      { _key: "c5", title: "Environment", href: "/environment", color: "maroon" },
      { _key: "c6", title: "Town Council", href: "/council", color: "dark-green" },
    ],
    homepageHero: {
      heading: "Welcome to Langport Life",
      subheading: "Your community hub for events, venues, businesses, and council information in Langport, Somerset.",
    },
    didYouKnow:
      "Langport was once one of the most important towns in Somerset, serving as a major inland port and mint town in Saxon times. The Hanging Chapel on the hill is one of only a handful of such structures remaining in England.",
    footerText: `© ${new Date().getFullYear()} Langport Town Council. All rights reserved.`,
    emergencyContacts: [
      { _key: "e1", name: "Environment Agency Floodline", phone: "0345 988 1188" },
      { _key: "e2", name: "Somerset Council", phone: "0300 123 2224" },
    ],
  });

  // ─── 2. Navigation ───
  console.log("🧭 Creating Navigation...");
  await client.createOrReplace({
    _id: "navigation",
    _type: "navigation",
    mainMenu: [
      {
        _key: "n1",
        title: "What's On",
        href: "/events",
        children: [
          {
            _key: "n1g1",
            groupTitle: "Events",
            links: [
              { _key: "n1g1l1", title: "Events Calendar", href: "/events" },
              { _key: "n1g1l2", title: "Submit an Event", href: "/submit/event" },
            ],
          },
        ],
      },
      { _key: "n2", title: "Things to Do", href: "/things-to-do" },
      { _key: "n3", title: "Venues", href: "/venues" },
      { _key: "n4", title: "Shops & Services", href: "/listings" },
      { _key: "n5", title: "History", href: "/history" },
      {
        _key: "n6",
        title: "Town Council",
        href: "/council",
        children: [
          {
            _key: "n6g1",
            groupTitle: "Councillor Information",
            links: [
              { _key: "n6g1l1", title: "Town Councillors", href: "/council/members" },
              { _key: "n6g1l2", title: "Somerset Councillors", href: "/council/somerset-councillors" },
            ],
          },
          {
            _key: "n6g2",
            groupTitle: "Governance & Transparency",
            links: [
              { _key: "n6g2l1", title: "Finance", href: "/council/finance" },
              { _key: "n6g2l2", title: "Governance", href: "/council/governance" },
            ],
          },
          {
            _key: "n6g3",
            groupTitle: "Agendas & Minutes",
            links: [
              { _key: "n6g3l1", title: "All Committees", href: "/council/documents" },
              { _key: "n6g3l2", title: "Full Council", href: "/council/documents/full-council" },
              { _key: "n6g3l3", title: "Finance & Personnel", href: "/council/documents/finance-personnel" },
              { _key: "n6g3l4", title: "Tourism & Marketing", href: "/council/documents/tourism-marketing" },
              { _key: "n6g3l5", title: "Joint Committee", href: "/council/documents/joint-committee" },
              { _key: "n6g3l6", title: "Annual Assembly", href: "/council/documents/annual-assembly" },
              { _key: "n6g3l7", title: "Archived Minutes", href: "/council/documents/archived" },
            ],
          },
        ],
      },
      { _key: "n7", title: "News", href: "/news" },
    ],
    footerColumns: [
      {
        _key: "f1",
        title: "Explore",
        links: [
          { _key: "f1l1", title: "Events", href: "/events" },
          { _key: "f1l2", title: "Venues", href: "/venues" },
          { _key: "f1l3", title: "Business Listings", href: "/listings" },
          { _key: "f1l4", title: "History", href: "/history" },
        ],
      },
      {
        _key: "f2",
        title: "Council",
        links: [
          { _key: "f2l1", title: "Overview", href: "/council" },
          { _key: "f2l2", title: "Members", href: "/council/members" },
          { _key: "f2l3", title: "Documents", href: "/council/documents" },
          { _key: "f2l4", title: "Environment", href: "/environment" },
        ],
      },
      {
        _key: "f3",
        title: "About",
        links: [
          { _key: "f3l1", title: "About Langport", href: "/about" },
          { _key: "f3l2", title: "Getting Here", href: "/getting-here" },
          { _key: "f3l3", title: "Submit an Event", href: "/submit" },
          { _key: "f3l4", title: "Add a Business", href: "/submit/listing" },
        ],
      },
    ],
  });

  // ─── 3. Transport Options ───
  console.log("🚂 Creating Transport Options...");

  const trains = [
    { title: "Castle Cary", distance: "15 miles", railLine: "Great Western Railway main line", journeyNotes: "Direct trains from London Paddington (approx. 1hr 40min)", order: 1 },
    { title: "Taunton", distance: "14 miles", railLine: "Great Western Railway main line", journeyNotes: "Major interchange with frequent services from London, Bristol, and Exeter", order: 2 },
    { title: "Bridgwater", distance: "12 miles", railLine: "Great Western Railway main line", journeyNotes: "Services from Bristol Temple Meads and Exeter", order: 3 },
    { title: "Yeovil Pen Mill", distance: "13 miles", railLine: "Heart of Wessex line", journeyNotes: "Services from Weymouth, Bath Spa, and Bristol", order: 4 },
  ];

  const buses = [
    { title: "Route 54", routeNumber: "54", operator: "First Bus", routeDescription: "Taunton – Langport – Somerton – Yeovil", frequency: "Approximately hourly, Mon–Sat", description: "The main bus service through Langport", order: 1 },
    { title: "Route 55", routeNumber: "55", operator: "First Bus", routeDescription: "Wrantage – Langport – Somerton – Street", frequency: "Limited service, Mon–Sat", description: "Connects to Street and Glastonbury area", order: 2 },
    { title: "Route 16", routeNumber: "16", operator: "Hatch Green Coaches", routeDescription: "Bridgwater – Langport", frequency: "Limited service", description: "Links to Bridgwater rail station", order: 3 },
  ];

  const parking = [
    { title: "Cocklemoor Car Park", postcode: "TA10 9PD", isFree: true, description: "Short stay (2hrs max, no return within 1hr) and long stay (24hrs) in designated areas. 24-hour access, no height restriction. EV charging points available.", order: 1 },
    { title: "Stacey's Court Car Park", postcode: "TA10 9PB", isFree: true, description: "Convenient for the town centre and Bow Street shops.", order: 2 },
    { title: "Westover", postcode: "TA10 9PR", isFree: true, description: "On-road parking available along Westover. Useful overflow when other car parks are busy.", order: 3 },
  ];

  for (const t of trains) {
    await client.create({ _type: "transportOption", type: "train", ...t });
  }
  for (const b of buses) {
    await client.create({ _type: "transportOption", type: "bus", ...b });
  }
  for (const p of parking) {
    await client.create({ _type: "transportOption", type: "parking", ...p });
  }
  await client.create({
    _type: "transportOption",
    type: "cycling",
    title: "Cycling to Langport",
    description: "The Somerset Levels offer some of the flattest and most scenic cycling in the South West. Langport is accessible via quiet country lanes from Somerton, Curry Rivel, and Muchelney. The towpath along the River Parrett provides a lovely off-road route towards Oath and Burrowbridge. Bike racks are available in the town centre near Bow Street.",
    order: 1,
  });

  // ─── 4. Activities ───
  console.log("🏔️ Creating Activities...");

  const activities = [
    {
      title: "Exploring the Wild",
      slug: { _type: "slug", current: "exploring-the-wild" },
      category: "exploring",
      excerpt: "Wildlife, nature reserves, birdwatching, and the unique ecology of the Somerset Levels near Langport.",
      content: [
        block("The River Parrett flows lazily past Langport as it crosses one of the most important wetlands in Europe. Whether you are looking from bridge, bank or boat, there is such a variety of creatures to spot, in the air, on the water, or teeming just under the surface."),
        block("Not forgetting the treasury of plants that line the river and rhynes and cluster on the meadows. This stretch of the river is an important central point in the renewed River Parrett Trail that runs from source to sea."),
      ],
      highlights: ["Cranes & herons", "Willows", "Bulrushes", "Eels", "Otters", "Water voles", "Dragonflies", "White egrets", "Kingfishers", "Damselflies", "Fish", "Swans and Moorhens"],
      order: 1,
      published: true,
    },
    {
      title: "The Outdoor Life",
      slug: { _type: "slug", current: "outdoor-life" },
      category: "outdoor",
      excerpt: "Water sports, fishing, golf, and outdoor activities on the River Parrett.",
      content: [
        block("Our beautiful river is more active than it's been in over a century. You can launch your own craft, hire canoes or kayaks, or take a leisurely scenic trip on a restored River Dart ferry — The Duchess of Cocklemoor."),
        block("4 pontoons for mooring to and swimming from and, if you are an angler, you can cast a line from fishing platforms and accessible riverbanks. Along the riverbank there are picnic areas and fitness apparatus, with interpretation boards crammed with fascinating information about this unique countryside."),
      ],
      youtubeUrl: "https://www.youtube.com/watch?v=gW_88XbKlhg",
      order: 1,
      published: true,
    },
    {
      title: "Walking & Cycling",
      slug: { _type: "slug", current: "walking-and-cycling" },
      category: "walking-cycling",
      excerpt: "Routes and trails through the Somerset Levels and surrounding countryside.",
      content: [
        block("All walks start and end at the Whatley Car Park."),
        block("In wet weather the paths and tracks can be very muddy and, except in prolonged dry weather, you will need hiking boots or wellies. In very wet weather there will probably be flooding."),
        block("Be careful if there are cattle with calves in fields that you cross. Keep dogs well under control and please leave gates as you found them."),
        block("There are several very pleasant pubs, restaurants and cafes in Langport town centre if you feel like some refreshments after your walk."),
      ],
      order: 1,
      published: true,
    },
    {
      title: "Kayaking & Canoeing",
      slug: { _type: "slug", current: "kayaking" },
      category: "outdoor",
      excerpt: "Launch your own craft or hire canoes and kayaks on the River Parrett.",
      content: [
        block("Our beautiful river is more active than it's been for over a century. You can launch your own craft, hire canoes, kayaks and paddleboards, or take a leisurely scenic trip on the Duchess of Cocklemoor (a restored River Dart ferry)."),
        block("Small boats may be launched from a slipway at Huish Bridge. There are strict speed limits on the river and boaters are advised to observe river levels and bridge heights very carefully."),
        block("If you fancy learning to row, the Somerset Community Rowing Club will be happy to teach you."),
      ],
      externalLinks: [
        { _key: "el1", title: "Somerset Community Rowing Club", url: "https://somersetcrc.co.uk/index.html#" },
      ],
      order: 2,
      published: true,
    },
    {
      title: "Paddleboarding",
      slug: { _type: "slug", current: "paddleboarding" },
      category: "outdoor",
      excerpt: "Our beautiful river is more active than it's been in over a century!",
      content: [
        block("Visitors can launch personal craft or take scenic trips on the Duchess of Cocklemoor, a lovingly restored River Dart ferry."),
        block("Modern pontoons for launching are available at four summer locations: Muchelney Bridge, Huish Bridge, Cocklemoor, and Great Bow Bridge."),
      ],
      order: 3,
      published: true,
    },
    {
      title: "Wild Swimming",
      slug: { _type: "slug", current: "wild-swimming" },
      category: "outdoor",
      excerpt: "Take to the water on warm summer days.",
      content: [
        block("Not everyone's cup of tea but adults and children (under supervision) do take to the water on warm summer days."),
        block("There are 4 pontoons along the river for mooring to and swimming from during the summer months, located at Muchelney Bridge, Huish Bridge, Cocklemoor, and Great Bow Bridge."),
      ],
      order: 4,
      published: true,
    },
    {
      title: "Boating",
      slug: { _type: "slug", current: "boating" },
      category: "outdoor",
      excerpt: "Explore the River Parrett by boat.",
      content: [
        block("Small boats may be launched from a slipway at Huish Bridge. There are strict speed limits on the river and boaters are advised to observe river levels and bridge heights very carefully."),
      ],
      order: 5,
      published: true,
    },
    {
      title: "Fishing",
      slug: { _type: "slug", current: "fishing" },
      category: "outdoor",
      excerpt: "The Langport & District Angling Association operates a fishing lake at Combe and day tickets for the River Parrett.",
      content: [
        block("The Langport & District Angling Association operates a fishing lake at Combe available to season ticket holders year-round. Day ticket holders may fish the River Parrett."),
        block("Tickets are available from Fosters Newsagents (Bow Street, Langport TA10 9PQ), TackleUK (27 Forest Hill, Yeovil BA20 2PH, 01935 476777), and Viaduct Fisheries Ltd (Cary Valley, Somerton TA11 6LJ, 01458 274022)."),
      ],
      externalLinks: [
        { _key: "el1", title: "Langport Angling Association", url: "http://www.langportaa.com" },
      ],
      order: 6,
      published: true,
    },
    {
      title: "Golf",
      slug: { _type: "slug", current: "golf" },
      category: "outdoor",
      excerpt: "Long Sutton Golf and Country Club — a parkland course set on the edge of the Levels.",
      content: [
        block("Long Sutton Golf and Country Club is a privately owned, gently undulating, parkland golf course, set on the edge of the levels in the heart of South Somerset."),
        block("Opened in 1991 and under new ownership since September 2019, the course was designed by Patrick Dawson. Set on 130 acres, 6352 yards in length, par 71 for men and par 72 for ladies, it has matured and continues to evolve to create an even more exciting and pleasurable golf experience."),
      ],
      externalLinks: [
        { _key: "el1", title: "Visit Long Sutton Golf", url: "https://www.longsuttongolf.com/" },
      ],
      order: 7,
      published: true,
    },
    {
      title: "Cycling",
      slug: { _type: "slug", current: "cycling" },
      category: "walking-cycling",
      excerpt: "The flat landscape makes the area hugely popular with cyclists of all ages.",
      content: [
        block("Huish Drove and the Old Railway Line form part of a circular route when combined with the Muchelney to Huish road."),
        block("The flat landscape makes the area hugely popular with cyclists of all ages, attracted to Langport by the cafes and the bicycle 'pit-stop', alongside the public toilets, where water bottles may also be refilled."),
        block("Somerset Council have produced some maps to help you."),
      ],
      externalLinks: [
        { _key: "el1", title: "Somerset Council Cycling Maps", url: "https://www.somerset.gov.uk/waste-planning-and-land/walking-and-cycling-maps" },
      ],
      order: 2,
      published: true,
    },
    {
      title: "The Parrett, Drove & Cocklemoor Walk",
      slug: { _type: "slug", current: "parrett-drove-and-cocklemoor-walk" },
      category: "walking-cycling",
      excerpt: "A delightful option combining riverside and drove views, approximately 2.5km.",
      distance: "2.5km (1.5 miles)",
      content: [
        block("A delightful option combining riverside and drove views. Begin at Cocklemoor heading south to the Parrett Trail riverbank path, proceeding to Huish Bridge (700m)."),
        block("At the bridge, you can observe a tributary joining the River Parrett — the Yeo which comes from Ilchester, a Roman Town. After crossing Huish Bridge, turn right onto Huish Drove for 900m, then right through bike gates along an industrial estate path (400m), passing Shakspeare Glass before returning via Whatley footbridge."),
      ],
      notices: [
        { _key: "n1", type: "warning", title: "Walking Conditions", text: "In wet weather the paths and tracks can be very muddy — you will need hiking boots or wellies. In very wet weather there will probably be flooding." },
      ],
      order: 3,
      published: true,
    },
    {
      title: "Muchelney Route",
      slug: { _type: "slug", current: "muchelney-route" },
      category: "walking-cycling",
      excerpt: "A walk to Muchelney via the old railway line, with an optional abbey detour.",
      distance: "5.7 to 7km (3.55 to 4.3 miles)",
      content: [
        block("Starts and ends at Whatley Car Park. Follow the Parrett Drove walk until the bike gates (1.6km), then turn left onto a cycle path built on an old railway line (1.5km)."),
        block("The path is elevated, enclosed and straight with vegetation including trees, dog roses, brambles and sloes. After descending to the road and turning left (300m), cross a stile and return along the Parrett Trail with the river on your right to Huish Bridge (1.6km), then retrace back to the car park."),
        block("Abbey Extension: An optional detour visits Muchelney Abbey, a 10th Century Benedictine site, plus St Peter and Paul Church with Saxon origins but largely dating from the 15th century (700m from the main route)."),
      ],
      notices: [
        { _key: "n1", type: "warning", title: "Walking Conditions", text: "Paths become very muddy in wet weather; hiking boots or wellies required. Be careful with cattle and calves, control dogs, and leave gates as you found them." },
      ],
      order: 4,
      published: true,
    },
    {
      title: "North Street Moor",
      slug: { _type: "slug", current: "north-street-moor" },
      category: "walking-cycling",
      excerpt: "A shorter walk through North Street Moor from Whatley Car Park.",
      distance: "2.0 to 3.4km (1.25 to 2.11 miles)",
      content: [
        block("Starts and ends at Whatley Car Park. The route proceeds north through Walter Bagehot Town Gardens, follows rhynes (water channels) past a Tesco footbridge, traverses railway arches, and reaches an old sluice with a handrail."),
        block("Continue along the river bank under a railway bridge through a metal gate, and return via rhynes to the town hall."),
        block("Monks Lease Clyse Side Walk: An alternate 750m extension that follows the Parrett River to Monks Lease Clyse and the Sowey River overflow."),
      ],
      notices: [
        { _key: "n1", type: "warning", title: "Walking Conditions", text: "Routes require hiking boots or wellies due to muddy conditions. Flooding occurs in very wet weather. Exercise caution around cattle with calves, control dogs, and leave gates as you found them." },
      ],
      order: 5,
      published: true,
    },
    {
      title: "Short Town Walks",
      slug: { _type: "slug", current: "short-town-walks" },
      category: "walking-cycling",
      excerpt: "Several short walks starting and ending at Whatley Car Park.",
      content: [
        block("Head south from Whatley Car Park to the Parrett Trail along the river bank, cross a footbridge after approximately 450 metres, then ascend to the road (250m). Pass the Hanging Chapel, on the site of the Saxon hill fort, before reaching All Saints Church (250m)."),
        block("Don't miss Walter Bagehot's grave and the views across the Levels southward at the cemetery."),
        block("Return options: Via Bush Place and Whatley Lane (300m), via the Hill and Langport Arms (350m), or via Priest Lane and North Street (550m)."),
      ],
      order: 6,
      published: true,
    },
  ];

  for (const activity of activities) {
    await client.create({ _type: "activity", ...activity });
  }

  console.log("\n✅ Seeding complete!");
  console.log(`   - 1 Site Settings singleton`);
  console.log(`   - 1 Navigation singleton`);
  console.log(`   - ${trains.length + buses.length + parking.length + 1} Transport Options`);
  console.log(`   - ${activities.length} Activities`);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
