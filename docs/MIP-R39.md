# MIP-R39: Restore Withdrawals on Moonriver by Setting Oracle Prices

## Summary

This proposal restores user withdrawals and redemptions on Moonwell’s Moonriver markets by setting placeholder prices in the oracle.

Chainlink previously deprecated all Moonriver price feeds, which caused price lookups to fail and blocked users from withdrawing or exiting markets. This proposal fixes that issue without changing risk parameters.

**This action will not cause liquidations.** Borrowing is disabled and collateral factors are set to 0% across all Moonriver markets. Prices are used only to allow withdrawals and exits to function again.

## Background

Moonwell requires valid asset prices to perform basic safety checks before allowing users to withdraw or exit markets. When Chainlink deprecated Moonriver feeds, the protocol could no longer retrieve prices for any Moonriver assets.

As a result:
- Users cannot redeem their mTokens
- Users cannot exit Moonriver markets
- Funds are effectively stuck despite zero borrowing risk

Prior governance action (MIP-R38) already set all Moonriver collateral factors to 0% and disabled borrowing. As such, prices are no longer used for risk, leverage, or liquidation logic — only to prevent system reverts during withdrawals.

## Proposal

This proposal sets fixed, non-zero prices in the Moonriver oracle so that withdrawals and exits can proceed normally.

### 1. MOVR (Native Token)

The MOVR market uses a special oracle path for the native token. To support this:

- A `StaticPriceFeed` contract is used
- The oracle feed for MOVR is pointed to this contract
- The feed returns a fixed MOVR price in standard Chainlink (8-decimal) format

This restores the ability to withdraw and exit the MOVR market.

### 2. ERC-20 Markets

For all ERC-20 Moonriver markets, the proposal sets direct prices in the oracle. These prices exist solely to unblock withdrawals and do not affect protocol risk.

| Market | Underlying Asset | Price |
|------|------------------|-------|
| USDC.multi | USDC | $1 |
| USDT.multi | USDT | $1 |
| FRAX | FRAX | $1 |
| ETH.multi | ETH | $2,050 |
| BTC.multi | BTC | $69,145 |
| xcKSM | KSM | $25 |

## Rationale

This proposal is a mechanical fix to restore user access to funds.

- Borrowing is disabled across all Moonriver markets
- Collateral factors are set to 0%
- No accounts rely on these prices for solvency
- Liquidations cannot occur as a result of this change

## Voting Options

- **YES** — Set oracle prices to safely restore withdrawals and exits on Moonriver  
- **NO** — Do not set prices; users remain unable to access their funds
- **ABSTAIN** - Conflict of Interest, lack of knowledge, etc