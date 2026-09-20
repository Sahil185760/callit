# Callit

**Create predictions. Build a league. Compete with friends.**

Callit is a personal project by **Sahil Harlalka**: a full-stack prediction app where players create private leagues, place play-money bets, and compete through shared outcomes. Prices reflect the coins committed to each side, and winning payouts come from the actual betting pool.

[Open Callit](https://prediction-leagues.sah1l0.chatgpt.site) · [Pricing and settlement](docs/PRICING.md) · [Development notes](docs/DEVELOPMENT.md)

## Project origin and contributions

**Original project date: August 10, 2026.** This date records the project's origin as reported by Sahil. This repository publishes the later Callit source snapshot, including subsequent refinements; it does not represent an archived August 10 version.

Sahil conceived Callit as a personal project and primarily worked on the backend and pricing algorithm. ChatGPT helped polish the frontend and implement sign-in, the association of signed-in identities with player accounts, and social interaction through shared leagues and invitations.

The current source implements league membership and invite codes. It does not include a separate friend-request system or linking multiple external providers to one account.

## What the app does

- **Personal coin accounts:** Sign in, choose a player name, and begin with 10,000 play-money coins.
- **Shared leagues:** Create a league or join friends using an invite code.
- **Custom predictions:** Define an outcome, resolution rules, closing time, and opening moneyline.
- **Pool-based betting:** Place Yes or No stakes, inspect changing probabilities, and preview potential returns.
- **Settlement and safeguards:** Commissioners resolve outcomes; community vetoes can void a market. Voided markets and deleted leagues refund unsettled stakes.
- **Persistent state:** Player balances, markets, trades, and league membership are stored in Cloudflare D1.

All balances and bets use virtual coins. There are no deposits, withdrawals, or real-money payouts in this source.

## Run locally

Requires Node.js **22.13 or newer** and **pnpm 11.25.0** (the pinned package manager).

```sh
git clone https://github.com/Sahil185760/callit.git
cd callit
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_brave_hammerhead.sql
pnpm dev
```

Open the local address printed by the development server, normally `http://localhost:5173`. Local development simulates ChatGPT sign-in with a test identity. Production sign-in is provided by the Sites hosting platform and requires equivalent trusted authentication when deploying elsewhere. See [development notes](docs/DEVELOPMENT.md).

## Source guide

| Location | Responsibility |
| --- | --- |
| `app/callit.tsx` | Main application interface |
| `app/api/game/route.ts` | Authenticated game actions and league permissions |
| `lib/game.ts` | Pricing, betting, settlement, veto refunds, and league deletion |
| `lib/store.ts` | Persistent state and revision-checked writes |
| `app/chatgpt-auth.ts` | Hosting-provided identity helpers |
| `drizzle/` | Database migration and schema metadata |
| `components/ui/` | Interface components included with the starter |
| `tests/` | Focused pricing and settlement checks |

Built with TypeScript, React, Vinext/Vite, Tailwind CSS, Cloudflare Workers, and D1. Third-party notices remain alongside their respective files.

## Validation

```sh
pnpm test
```

The tests exercise moneyline conversion, pool-funded payouts, void refunds, duplicate-trade protection, and commissioner-only league deletion. They run without installing application dependencies on a compatible Node.js version.

## Publication notes

This is a source export from Callit's September 19, 2026 checkout (`1c90ec9`). Publication commits use their actual publication dates. The original project date above is separate from repository creation and upload timestamps.

The export omits deployment-specific identifiers, private runtime data, and a historical one-off account credit. Application source, assets, dependency lockfile, database schema, and build support are included. The existing hosted site is maintained separately.
