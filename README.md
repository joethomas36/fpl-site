# THE LADS · 2025/26 FPL Banter Centre

A Soccer Saturday-vibe website for The LADS mini-league (ID 97972).

## Files in this folder

- `index.html` — main page
- `style.css` — all the yellow/black/red carnage
- `app.js` — JavaScript logic
- `data.js` — pre-computed stats from your FPL data
- `refresh.py` — script to regenerate `data.js` after a new GW

## Deploy it (Netlify, takes 60 seconds)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this entire folder onto the page
3. Netlify gives you a URL like `something-funny-name.netlify.app`
4. Paste that URL in the lads' group chat
5. Done

You can claim the site (free) to give it a custom name like `the-lads-fpl.netlify.app`.

## Refresh after a new GW

Two-step process:

### Step 1: Get fresh data

In Terminal:
```bash
cd ~/fpl-data && python3 fetch_fpl.py && python3 fetch_players.py
```

This re-pulls everything (~10 minutes total).

### Step 2: Regenerate data.js

Copy `refresh.py` into `~/fpl-data/`, then:

```bash
cd ~/fpl-data && python3 refresh.py
```

This produces a fresh `data.js` in the current folder. Replace the `data.js` in your site folder with this new one.

### Step 3: Redeploy

If using Netlify drop, just drag the folder again and replace.

If you've claimed the site, you can drag-and-drop on the deploys page of your site dashboard.

## What's where on the site

- **Headlines** — landing page for the casuals. League table, top awards, position chart over time
- **Table** — full standings with breakdown chart
- **Kroupi Shrine** — the saga, the timeline, the bench shame counter
- **Awards** — full ceremony, 24 categories of banter
- **Managers** — click any lad for full season dossier including roast, transfer history, captain log, chip log
- **Head to Head** — pick any two lads, see their full record. Heatmap of who beats who
- **Nerd Zone** — captaincy stats, bench misery, hit ROI, chip ROI, best/worst transfers

## In-jokes baked in

- **Kroupi Jr** has its own dedicated tab and runs through the ticker, the rotator stat, the awards page, and Kieran's manager page
- The ticker bar shows rotating banter headlines
- Manager pages auto-generate a roast based on each lad's stats
- Awards page has 24 categories with proper tongue-in-cheek titles

## Tech notes

- 100% client-side — no backend, no database, no API calls at runtime
- All stats are pre-computed and baked into `data.js` (~320KB)
- Mobile-friendly so the lads can read it on the toilet
- Dark mode by design (it's the Soccer Saturday aesthetic)
- Charts via Chart.js loaded from CDN

## Adding more in-jokes

If you want to add more lad-specific banter, the easiest place is in `app.js`:

- Search for `generateRoast` to edit per-manager roasts
- Search for `awards = [` to add/edit awards
- Search for `headlines = [` to change rotating hero copy

Just edit and re-deploy. No build step needed.
