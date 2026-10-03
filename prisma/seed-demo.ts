import { PrismaClient } from "@prisma/client";

// Additive demo data: only touches users with a @demo.chatelo.dev email, so real accounts survive re-runs.
const prisma = new PrismaClient();
const DEMO_DOMAIN = "demo.chatelo.dev";
const USER_COUNT = 40;
const POST_COUNT = 260;
const HOUR = 3600_000;

let seed = 20261002;
const rand = () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = <T>(a: T[]) => a[Math.floor(rand() * a.length)];
const chance = (p: number) => rand() < p;
const sample = <T>(a: T[], n: number) => [...a].sort(() => rand() - 0.5).slice(0, n);

const first = [
  "Maya",
  "Noah",
  "Priya",
  "Lucas",
  "Zara",
  "Ethan",
  "Amara",
  "Oliver",
  "Sofia",
  "Kai",
  "Layla",
  "Mateo",
  "Ines",
  "Jonas",
  "Hana",
  "Omar",
  "Freya",
  "Diego",
  "Nina",
  "Theo",
  "Yuki",
  "Callum",
  "Esme",
  "Rafael",
  "Anya",
];
const last = [
  "Patel",
  "Nguyen",
  "Okafor",
  "Silva",
  "Kowalski",
  "Haddad",
  "Larsen",
  "Moreau",
  "Tanaka",
  "Reyes",
  "Fischer",
  "Adeyemi",
  "Murphy",
  "Rossi",
  "Chen",
  "Dubois",
  "Santos",
  "Novak",
  "Khan",
  "Evans",
];
const domains = [
  "devblog.example.com",
  "portfolio.example.io",
  "studio.example.net",
  "notes.example.org",
];

const posts = [
  "Just shipped a big refactor and nothing broke. Suspicious. #coding #shipit",
  "Monday coffee hits different when the build is green ☕ #devlife",
  "Hot take: tabs vs spaces matters less than a good linter. #coding",
  "Finally learned how database indexes actually work. Mind blown. #sql #learning",
  "Anyone else feel like they Google the same thing every week? #devlife",
  "Morning run done, 8k. Now to tackle the inbox. #fitness #monday",
  "New blog post is up: what I learned from my first year as a lead. #career #writing",
  "That feeling when the bug was a missing semicolon all along 🤦 #debugging",
  "Weekend project: a tiny weather dashboard. Surprisingly fun. #sideproject #coding",
  "Cooked a proper ragù from scratch today. Worth the four hours. #cooking #foodie",
  "Reading 'The Pragmatic Programmer' again. Still holds up. #books #coding",
  "Rain all day. Perfect excuse to stay in and write code. #rainyday #devlife",
  "Sunrise from the summit this morning. Absolutely worth the early alarm 🌄 #hiking #nature",
  "Pair programming session was the best part of my week. #teamwork #coding",
  "Dark mode or light mode? Be honest. #devlife #poll",
  "Trying a new sourdough starter. Day 3 and it is alive! #baking #foodie",
  "Code review tip: comment on what's good, not just what's wrong. #career #teamwork",
  "My cat has decided my keyboard is her bed. Productivity: zero. #cats #wfh",
  "Three hours of debugging, one line fix. Classic. #debugging #devlife",
  "Just booked flights for the autumn trip. Cannot wait! ✈️ #travel",
  "Learning Rust. The compiler is basically a very strict, very kind mentor. #rust #learning",
  "Photo walk around the old town this evening. The light was unreal 📷 #photography #travel",
  "TIL you can write a whole app with just HTML and a bit of patience. #webdev #learning",
  "Standup ran for 4 minutes today. A new record. #agile #teamwork",
  "Hot chocolate and a good book. Perfect Sunday. #books #cozy",
  "Deployed on a Friday. Living dangerously. #shipit #devlife",
  "Started a 30-day challenge: one small project a day. Day 1 done! #sideproject #challenge",
  "The best documentation is the one that actually gets updated. #coding #docs",
  "Gym PR today! Small win but I'll take it. 💪 #fitness",
  "Anyone have recommendations for a good mechanical keyboard? #devlife #hardware",
  "Local farmers market haul was incredible this weekend. #foodie #cooking",
  "Just discovered a new indie band and I've played their album on repeat. #music",
  "Refactoring legacy code is like archaeology, except the artefacts are bugs. #coding #debugging",
  "Great talk at the meetup tonight on accessibility. We can all do better. #a11y #webdev",
  "Autumn leaves everywhere. Best season, fight me. 🍂 #nature #photography",
  "Wrote my first unit test in months. Felt good. Found two bugs. #testing #coding",
  "Sunday reset: laundry, meal prep, and a long walk. #fitness #selfcare",
  "Remote work tip: have a hard stop for the day. Your future self will thank you. #wfh #career",
  "Does anyone actually enjoy writing commit messages? Asking for a friend. #git #devlife",
  "Built a little CLI tool to automate my morning routine. Saves five minutes a day, took five days. #sideproject #coding",
  "Concert tonight was electric. Still buzzing! 🎶 #music #livemusic",
  "Season finale left me speechless. No spoilers please. #tv",
  "Trying to cut down on meetings this week. Wish me luck. #productivity",
  "Opened a PR with 12 lines changed and 300 lines of comments. Love this team. #teamwork #coding",
  "Perfect flat white at the new place downtown ☕ #coffee",
  "Why is naming things still the hardest problem? #coding #devlife",
  "Beach day with the family. Phones off, sunscreen on. 🏖️ #travel #family",
  "Just hit 100 days of learning Spanish. ¡Muy bien! #learning #languages",
  "Making the switch to TypeScript on an old project. Wish me luck. #typescript #webdev",
  "Pizza night. Homemade dough, no regrets. 🍕 #foodie #cooking",
  "Grateful for teammates who answer questions at 5pm on a Friday. #teamwork #career",
  "Garden update: tomatoes are finally ripening! 🍅 #gardening #nature",
  "Sketched out a new app idea on a napkin. Let's see where it goes. #sideproject",
  "Long day. Lo-fi playlist and a cup of tea are doing the heavy lifting. #selfcare #music",
  "Switching to vim keybindings everywhere. Send help. #devlife #productivity",
  "Visited the science museum with the kids. They loved the space exhibit! 🚀 #family #learning",
  "Tip: write the test first, even if it feels slow. #testing #coding",
  "Spent the evening organising my bookshelf by colour. No regrets. #books #cozy",
];
const replies = [
  "Couldn't agree more!",
  "This made my day 😄",
  "Love this.",
  "So true.",
  "Great share, thanks!",
  "Needed this today.",
];

async function main() {
  await prisma.user.deleteMany({ where: { email: { endsWith: `@${DEMO_DOMAIN}` } } });

  const names = new Set<string>();
  while (names.size < USER_COUNT) names.add(`${pick(first)} ${pick(last)}`);

  const now = Date.now();
  const users = [];
  for (const name of names) {
    const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
    const online = chance(0.3);
    users.push(
      await prisma.user.create({
        data: {
          name,
          email: `${handle}@${DEMO_DOMAIN}`,
          website: chance(0.35) ? `https://${handle.split(".")[0]}.${pick(domains)}` : null,
          lastSignedInAt: new Date(
            now - (online ? rand() * 0.2 * HOUR : (0.5 + rand() * 96) * HOUR),
          ),
          createdAt: new Date(now - (7 + rand() * 60) * 24 * HOUR),
        },
      }),
    );
  }

  const createdPosts: { id: number; authorId: number; createdAt: Date }[] = [];
  const active = users.slice(0, 28);
  for (let i = 0; i < POST_COUNT; i++) {
    // 40% of posts land in the last 24h so "Popular today" is populated.
    const ageHours = chance(0.4) ? rand() * 24 : 24 + rand() * 24 * 13;
    const author = chance(0.7) ? pick(active) : pick(users);
    let content = pick(posts);
    if (chance(0.15)) content += ` ${pick(replies)}`;
    const tags = [
      ...new Set([...content.matchAll(/#([\p{L}\p{N}_]+)/gu)].map((m) => m[1].toLowerCase())),
    ];
    const createdAt = new Date(now - ageHours * HOUR);
    const post = await prisma.post.create({
      data: {
        content,
        authorId: author.id,
        createdAt,
        imageUrl: chance(0.12) ? `https://picsum.photos/seed/chatelo${i}/800/500` : null,
        hashtags: { connectOrCreate: tags.map((tag) => ({ where: { tag }, create: { tag } })) },
      },
    });
    createdPosts.push({ id: post.id, authorId: author.id, createdAt });
  }

  // Skewed fire counts: a few viral posts, many with a handful.
  const fires = [];
  for (const p of createdPosts) {
    const n = chance(0.08) ? 15 + Math.floor(rand() * 20) : Math.floor(rand() * rand() * 12);
    for (const u of sample(users, n))
      if (u.id !== p.authorId) fires.push({ userId: u.id, postId: p.id });
  }
  await prisma.fire.createMany({ data: fires });

  // Follows among demo users, with a few popular accounts.
  const popular = users.slice(0, 8);
  const follows = new Map<string, { followerId: number; followingId: number }>();
  const add = (followerId: number, followingId: number) => {
    if (followerId !== followingId)
      follows.set(`${followerId}:${followingId}`, { followerId, followingId });
  };
  for (const u of users) {
    for (const t of sample(popular, 2 + Math.floor(rand() * 5))) add(u.id, t.id);
    for (const t of sample(users, 3 + Math.floor(rand() * 10))) add(u.id, t.id);
  }

  // Wire real (non-demo) accounts in too, so their feed and follower lists feel alive.
  const real = await prisma.user.findMany({
    where: { email: { not: { endsWith: `@${DEMO_DOMAIN}` } } },
  });
  for (const r of real) {
    for (const t of sample(users, 12)) add(r.id, t.id);
    for (const t of sample(users, 15)) add(t.id, r.id);
  }
  await prisma.follow.createMany({ data: [...follows.values()] });

  await prisma.hashtag.deleteMany({ where: { posts: { none: {} } } });

  const [u, p, f, fo, h] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.fire.count(),
    prisma.follow.count(),
    prisma.hashtag.count(),
  ]);
  console.log({
    users: u,
    posts: p,
    fires: f,
    follows: fo,
    hashtags: h,
    realAccountsKept: real.length,
  });
}

main().finally(() => prisma.$disconnect());
