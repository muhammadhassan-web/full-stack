# The Small Web

Next.js + NestJS + MongoDB. A browser for a small database-backed web.

## Run

Needs Node 20+ and MongoDB on localhost:27017 (`docker compose up -d` or a local install).

```
cd api
npm install
npm run seed
npm run start:dev
```

```
cd web
npm install
npm run dev
```

Open http://localhost:3000. The seed is idempotent: run `npm run seed` twice, then `npm run check-seed` shows the same counts.

Tests: `npm test` in `api` and in `web`.