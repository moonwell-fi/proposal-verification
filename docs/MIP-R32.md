# MIP-R32: Pause Mint/Borrow on Moonriver

## Summary

This proposal pauses minting (supplying) and borrowing across Moonwell markets on Moonriver due to the scheduled deprecation of Chainlink price feeds used to secure these markets. The markets affected are the xcKSM, MOVR, and FRAX markets, respectively. This action keeps users protected and maintains protocol safety while Moonriver markets have deprecated oracle service.

## Background

Chainlink has officially designated **most price feeds on Moonriver for deprecation on November 10th, 2025**. Once deprecated, these feeds will:

- Stop receiving reliable price updates
- No longer be actively monitored for accuracy
- Potentially become stale or exploitable

This creates risk for Moonwell markets on Moonriver, including:

- Incorrect collateral valuations
- Failed or inaccurate liquidations
- Users potentially becoming unable to safely withdraw or repay
- Bad debt accumulation at the protocol level

Moonwell lending markets rely on Chainlink price feeds to determine collateral value and borrowing power. Operating without reliable oracle data represents an unacceptable solvency and user safety risk.

**Source:**
[Chainlink Documentation — Deprecation of Moonriver Data Feeds](https://docs.chain.link/data-feeds/deprecating-feeds?page=1&testnetPage=1#moonriver-mainnet)

## Proposal

This proposal enacts the following changes on **Moonriver** only for the MOVR, xcKSM, and FRAX markets:

### 1. Pause Minting (Supplying)

No new collateral can be supplied to Moonriver markets.

### 2. Pause Borrowing

No new borrowing positions can be opened on Moonriver.

### 3. Withdrawals and Repayments Remain Open

Users retain the ability to:
- Withdraw previously supplied collateral (subject to liquidity)
- Repay borrowed assets to close out existing positions

This ensures **all users can safely repay their loans and withdraw collateral** until a new oracle can be found.

## Rationale

Because Chainlink price feeds underpin collateral valuation and liquidation mechanics, their scheduled deprecation introduces unavoidable oracle risk that could lead to incorrect pricing, failed liquidations, or the formation of bad debt. This proactive, risk-off action prevents new exposure while preserving our users' ability to unwind positions safely and aligns with Moonwell's security-first operational principles.

## Voting Options

- **Yes** — Pause minting and borrowing on Moonriver; withdrawals and repayments remain open. This will pause borrow/supply for MOVR, xcKSM, and FRAX.
- **No** — Continue normal operations on Moonriver despite oracle deprecation risk.
- **Abstain** — No preference.

## Technical Implementation

This proposal executes 6 actions through the Moonwell governance system:

1. `_setMintPaused(MOVR_MARKET, true)` - Pause supplying on MOVR market
2. `_setMintPaused(xcKSM_MARKET, true)` - Pause supplying on xcKSM market
3. `_setMintPaused(FRAX_MARKET, true)` - Pause supplying on FRAX market
4. `_setBorrowPaused(MOVR_MARKET, true)` - Pause borrowing on MOVR market
5. `_setBorrowPaused(xcKSM_MARKET, true)` - Pause borrowing on xcKSM market
6. `_setBorrowPaused(FRAX_MARKET, true)` - Pause borrowing on FRAX market

All actions target the Comptroller contract and do not affect:
- Existing supply/borrow positions
- User ability to withdraw (subject to available liquidity)
- User ability to repay borrowed assets
- Liquidations (which can still occur if positions become undercollateralized)

## Testing

The proposal has been thoroughly tested using a fork of Moonriver at block 3,800,000. The test suite validates:

- ✅ Markets are NOT paused before proposal execution
- ✅ Proposal executes successfully through governance
- ✅ Markets ARE paused after proposal execution
- ✅ All 6 pause actions complete successfully

Test location: `test/apollo/mip-r32/`

Run tests with: `npm test -- ./test/apollo/mip-r32/`
