import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const h = (n: number) => new Date(Date.now() - n * 3600_000);

async function main() {
  await prisma.fire.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    [
      ["Ada Lovelace", "ada@chatelo.dev", "https://ada.example.com", 0.05],
      ["Grace Hopper", "grace@chatelo.dev", "https://grace.example.com", 0.2],
      ["Alan Turing", "alan@chatelo.dev", null, 3],
      ["Linus Torvalds", "linus@chatelo.dev", "https://linux.example.com", 30],
      ["Margaret Hamilton", "margaret@chatelo.dev", null, 72],
      ["Tim Berners-Lee", "tim@chatelo.dev", "https://w3.example.com", 0.1],
    ].map(([name, email, website, hrs]) =>
      prisma.user.create({
        data: {
          name: name as string,
          email: email as string,
          website: website as string | null,
          lastSignedInAt: h(hrs as number),
        },
      }),
    ),
  );

  const texts = [
    "Hello Chatelo! First post here 🔥",
    "Shipping a new feature today.",
    "Debugging is just being the detective in a crime movie where you are also the murderer.",
    "Coffee count: 4 and it's only 10am.",
    "Anyone else love a good compiler error message?",
    "Weekend project: building a tiny social network.",
    "Learning something new every day.",
    "The best code is the code you don't write.",
  ];
  const posts = [];
  for (let i = 0; i < texts.length; i++) {
    posts.push(
      await prisma.post.create({
        data: { content: texts[i], authorId: users[i % users.length].id, createdAt: h(texts.length - i) },
      }),
    );
  }
  const fireMap: [number, number[]][] = [
    [0, [1, 2, 3]],
    [2, [0, 1, 3, 4, 5]],
    [4, [0, 2, 5, 1]],
    [6, [3]],
  ];
  for (const [p, us] of fireMap)
    for (const u of us)
      if (users[u].id !== posts[p].authorId)
        await prisma.fire.create({ data: { userId: users[u].id, postId: posts[p].id } });
}

main().finally(() => prisma.$disconnect());
