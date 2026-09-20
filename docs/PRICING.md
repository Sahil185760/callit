# Pricing and settlement

Callit uses a pool-funded model for custom prediction markets. The implementation is in `lib/game.ts`.

## Opening price

Before the first stake, the displayed probability comes from the creator's American moneyline:

- Negative line `L`: `p = -L / (-L + 100)`.
- Positive line `L`: `p = 100 / (L + 100)`.

For example, −150 corresponds to 60%; +150 corresponds to 40%. Accepted lines range from −10000 to −100 or +100 to +10000.

## Pool price

Let `Y` be the Yes pool and `N` the No pool. Once stakes exist, the displayed Yes probability is `Y / (Y + N)`. This is a share of committed coins, not an independently estimated likelihood.

For a new stake `c` on a side with pool `W`, the quoted total return is:

```text
potential return = c × (Y + N + c) / (W + c)
```

The quote includes the stake. It can change as later participants add coins; it does not lock a payout at entry.

## Settlement

A winning stake receives its proportional share of the final total pool:

```text
payout = winning stake / final winning-side pool × final total pool
```

If Yes has 300 coins and No has 100 coins, a 60-coin Yes stake returns 80 coins when Yes wins: 60 coins of stake plus 20 coins of profit. Losing stakes receive zero. A void outcome, or an outcome with no winning-side stakes, refunds every stake.

The algorithm uses JavaScript numbers rather than an integer minor-unit ledger. Tiny floating-point rounding differences are possible. This implementation is intended for play-money competition.
