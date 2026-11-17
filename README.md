[![make.fun · makefun-frontend-01](https://make.fun/badge/makefun-frontend-01.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![rank](https://make.fun/badge/makefun-frontend-01/nagn4g/makefun-frontend-01/rank.svg)](https://make.fun/bounty/makefun-frontend-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)
[![reward](https://make.fun/badge/makefun-frontend-01/nagn4g/makefun-frontend-01/reward.svg)](https://make.fun/bounty/makefun-frontend-01?utm_source=github&utm_medium=readme&utm_campaign=makefun-frontend-01)

# make.fun frontend

A framework-free, read-only frontend reading only https://make.fun/api.

| Surface / hash route | File | Screenshot |
| --- | --- | --- |
| Board `#/` | `app/views.js` | `screenshots/1-board.jpg` |
| Bounty `#/bounty/<slug>` | `app/views.js` | `screenshots/2-bounty.jpg` |
| Leaderboard `#/bounty/<slug>/leaderboard` | `app/secondary.js` | `screenshots/3-leaderboard.jpg` |
| Profile `#/u/<handle>` | `app/secondary.js` | No screenshot |

The board sorts live bounties first by deadline, with closed bounties last.
“Available rewards” sums only open pots. Search filters titles.
Pagination uses client-side slices: 20 bounties per board page and 50 entries per leaderboard page.

Money is in **dollars**: `rewardAmount`, `potUsd`, and `entryFeeUsd` are plain numbers.
Judge scores and win rates are in micro units; divide by **1e6** to display values such as `0.933`.

First-load transfer is **8,574 bytes gzip across 6 files**, under the 30 KB target.

Run locally with `node serve.ts --port 8081` or `node main.ts --serve --port 8081`.
Build the dossier with `MAKEFUN_OUTPUT_DIR=out node main.ts`.

The three screenshots linked above are fresh renders of this app on live data.
Live verification covered all four routes, with these observed values:

- Board: **$4,342.50** available rewards.
- Bounty: **LIVE POT $1,000** and **ENTRY FEE Free**.
- Leaderboard: win rates **0.933**.
- Profile: **ENTERED 17 / PLACED 10 / WON 0 / BEST 64 / PRIZE $3.00**.
