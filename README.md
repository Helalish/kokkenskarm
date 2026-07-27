# Shopbox KDS

Kitchen Display System frontend (Next.js).

```bash
npm install
npm run dev
```

## Environment variables

Public config is committed:

- `.env` — shared Firebase web config
- `.env.development` / `.env.production` — backend URL + Firestore path env
- `.env.example` — key list

`next dev` loads development values; `next build` / `next start` load production values.
