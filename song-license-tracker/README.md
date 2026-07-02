# Song Contract Tracker

Tracks music licensing deals per song and shows which songs are currently
**available to use** (no active contract), **licensed** (an active contract
is in effect), or **upcoming** (a contract is signed but hasn't started yet).

This is a standalone app (Node/Express + SQLite backend, React/Vite frontend)
and isn't part of the Playwright monorepo build.

## Structure

- `server/` — Express API backed by SQLite (`node:sqlite`, no native deps).
  Seeded with sample songs and licensing contracts.
- `client/` — React + TypeScript UI (Vite). Dev server proxies `/api` to the backend.

## Running it

In one terminal:

```bash
cd server
npm install
npm run seed   # populate data.sqlite with sample songs/contracts
npm start      # http://localhost:4000
```

In another terminal:

```bash
cd client
npm install
npm run dev    # http://localhost:5173
```

Open http://localhost:5173. The **Available** tab (default) lists songs whose
contract has expired (or that were never licensed) and are free to use. Use
**+ Add song** to add a new song, and **Add contract** on any song to record a
licensing deal with a licensor and start/end date.

## API

- `GET /api/songs?status=available|licensed|upcoming|all&q=search`
- `GET /api/songs/:id`
- `POST /api/songs` `{ title, artist, genre? }`
- `POST /api/songs/:id/contracts` `{ licensor, startDate, endDate, notes? }`
- `GET /api/stats`
