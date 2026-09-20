# Callit

**Create predictions. Build a league. Compete with friends.**

I built Callit as a personal project to let friends create prediction leagues and compete using play-money coins. Players can make their own predictions, bet on outcomes, and see how the odds change as others join in. Winning payouts come from the coins in the betting pool.

[Open Callit](https://prediction-leagues.sah1l0.chatgpt.site) · [Pricing and settlement](docs/PRICING.md) · [Development notes](docs/DEVELOPMENT.md)

## How I built it

**I started this project on August 10, 2026.** The code here includes improvements made since then.

The idea for Callit was mine, and I mainly worked on the backend and pricing algorithm. I used ChatGPT to help polish the frontend and add sign-in, connect signed-in users to their player accounts, and let friends play together through shared leagues and invitations.

Friends connect by joining a league with an invite code. Each player account is tied to ChatGPT sign-in.

## What the app does

- **Personal coin accounts:** Sign in, choose a player name, and begin with 10,000 play-money coins.
- **Shared leagues:** Create a league or join friends using an invite code.
- **Custom predictions:** Define an outcome, resolution rules, closing time, and opening moneyline.
- **Pool-based betting:** Place Yes or No stakes, see the odds change, and preview potential returns.
- **Settlement and safeguards:** Commissioners resolve outcomes; community vetoes can void a market. Voided markets and deleted leagues refund unsettled stakes.
- **Saved progress:** Player balances, markets, trades, and league membership are stored in Cloudflare D1.

All balances and bets use virtual coins. There are no deposits, withdrawals, or real-money payouts in the app.

## Run it locally

You'll need Node.js **22.13 or newer** and **pnpm 11.25.0**.

```sh
git clone https://github.com/Sahil185760/callit.git
cd callit
pnpm install --frozen-lockfile
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_brave_hammerhead.sql
pnpm dev
```

Open the local address printed by the development server, normally `http://localhost:5173`. The local version uses a test account to simulate ChatGPT sign-in. The live app uses sign-in provided by ChatGPT Sites. If you host it somewhere else, you’ll need to set up authentication for that platform. See [development notes](docs/DEVELOPMENT.md).

## Finding your way around the code

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

## Tests

```sh
pnpm test
```

The tests cover moneyline conversion, pool-funded payouts, void refunds, duplicate-trade protection, and commissioner-only league deletion. They run without installing application dependencies on a compatible Node.js version.

## Publication notes

I published this code on GitHub on September 19, 2026, using the Callit source from that day (`1c90ec9`). August 10 marks when I started the project; GitHub commits show when the code was uploaded or updated here.

This repository includes the app code, assets, dependency lockfile, database schema, and build files. I left out private account data, hosting identifiers, and a one-time credit used on my own account. The live site is maintained separately.
