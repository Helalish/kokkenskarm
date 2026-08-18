# Shopbox KDS

Kitchen Display System for Shopbox (Next.js).

**Version:** 1.0.0 (MVP)

## Features

- Login, client & branch selection
- Live kitchen board (grid, kanban, summary views)
- Customer-facing pickup display
- Firebase auto-sync for new orders, order status updates, and settings changes
- SMS history & ready-state notifications (when enabled)
- Settings (sound, SMS, auto-dismiss, language)
- Local translations (Danish & English) in `src/lib/translations.ts`

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Staff login |
| `/select-client` | Choose restaurant / client |
| `/select-branch` | Choose branch |
| `/kds` | Kitchen display board |
| `/customer-display` | Customer pickup screen |
| `/settings` | KDS settings |

## Setup

```bash
npm install
npm run dev
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

Requires **Node.js ≥ 20.9**.

## Environment

| File | Purpose |
|------|---------|
| `.env` | Shared Firebase web config |
| `.env.development` | Dev backend URL + Firestore env |
| `.env.production` | Prod backend URL + Firestore env |
| `.env.example` | Variable reference |

`next dev` loads development values; `next build` / `next start` load production values.
