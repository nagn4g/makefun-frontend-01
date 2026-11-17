# make.fun — build something, win something

[![make.fun](https://img.shields.io/badge/make.fun-live%20bounties-62e6b5)](https://make.fun)
[![make.fun API](https://img.shields.io/badge/make.fun-public%20API-8ba7ff)](https://make.fun/api/competitions)
[![make.fun entry](https://img.shields.io/badge/make.fun-frontend%2001-62e6b5)](https://make.fun/bounty/makefun-frontend-01)

Competition: https://make.fun/bounty/makefun-frontend-01

Framework-free, read-only frontend. Run `node serve.ts --port 8081` or `node main.ts --serve --port 8081`.
Build the dossier with `MAKEFUN_OUTPUT_DIR=out node main.ts`. The vendor library remains unchanged.

| Surface | File | Screenshot |
| --- | --- | --- |
| `#/` board | `app/views.js` | `screenshots/1-board.jpg` (existing, not recaptured) |
| `#/bounty/<slug>` | `app/views.js` | `screenshots/2-bounty.jpg` (existing, not recaptured) |
| `#/bounty/<slug>/leaderboard` | `app/secondary.js` | No matching capture verified |
| `#/u/<handle>` | `app/secondary.js` | None |

Deliberate product decisions: the board orders closing soonest first, closed last. “Available rewards” sums only open pots, rather than advertising already closed rewards. Search filters titles before local pagination (20 bounties, 50 ranked entries).

First-load gzip bytes: **8,674** (sum of per-file gzip level 9, six initial files). Leaderboard and profiles share a deferred module. Run `node verify.mjs` to recompute the figure and exercise the fixture checks.

The API uses a 60-second memory cache and ETag revalidation. Cursor pages are collected before local slicing. Money stays in integer micro-USD; missing values render as “—”. Countdown uses the first exposed server Date header. The minute refresh only patches countdown and pot nodes, and navigation aborts obsolete requests.

No screenshots were taken and no submission was made in this completion session. Existing images are historical artifacts, not evidence of this revision.

## Verification limits

All five app JavaScript files pass `node --check`. The dossier build succeeds with the existing three images, including the historical `3-bounty.jpg`; it does not establish screenshot agreement. The requested server command was attempted, but this sandbox refuses listening on `127.0.0.1:8081` with `EPERM`. External API calls fail because the egress proxy is unreachable; bypassing it fails DNS resolution. Consequently live board, bounty rewards, ranked leaderboard, and profile wallet/record verification remain unconfirmed. Fixture checks are explicitly separate from live checks.

`node verify.mjs` passes render-function checks for every surface, exact monetary formatting, escaping, empty states, ordering, cursor traversal, TTL, ETag revalidation, and first-response server-clock retention. The optional `verify-browser.mjs` check takes no screenshots; its launch was blocked by the environment's required Hatch WebGL domain policy. Dossier output is `out/dossier.json` (548,996 bytes at this revision). HTTP curl checks for `/`, `/main.js`, and `/style.css` all returned connection failure, not HTTP 200.
