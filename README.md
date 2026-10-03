# Chatelo

Next.js 15 + shadcn/ui + Prisma (SQLite) social network.

```
npm install
npm run db:setup   # create SQLite DB and seed sample users/posts
npm run dev
```

- `/posts` feed (newest first), composer with image upload, "Most fired" sidebar, other profiles (5, online/offline filter)
- `/users/[id]` profile + posts; `/users/[id]/edit` name/email/website
- No passwords: visitors who are not signed in see a blocking modal to log in (by email) or create a profile; "My profile" and "Log out" only show once signed in (online = active in last 15 min).
- Uploads are stored in `./uploads` and served via `/api/uploads/[name]`.
- Set `DATABASE_URL` in `.env` (SQLite by default).
- Follow: Follow/Following badge beside post authors and on profiles; profiles show follower/following counts linking to /users/[id]/followers and /users/[id]/following.
- Hashtags: #tags in posts are linked and stored; header search (people or #tag) at `/search`; feed sidebar shows popular hashtags from the last 24h.

