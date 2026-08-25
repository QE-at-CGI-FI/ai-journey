# AI-Native Journey Tracker

A small Vue 3 + Vite app (CGI branded) for tracking the AI-native journey: from
organizational **foundational enablers** to individual **experience growth**.

- **Organization** tab — foundational enablers sourced from `../org-capabilities.md`,
  grouped by theme. Each enabler has an on/off toggle and a details field. You can
  also add custom enablers per group.
- **Individual** tab — a personal growth checklist (name/role/team + growth areas)
  built the same way, so one person's journey can be tracked alongside the org's.
- All data is kept only in the browser's **local storage** (nothing is sent
  anywhere). Use **Export** to download a JSON backup, and **Import** to load one
  back in (e.g. on another machine, or to share a snapshot).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```
