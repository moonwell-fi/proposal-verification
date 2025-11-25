# MIP-R33: Pause Supply Emissions on Moonriver

## Summary

This proposal pauses supply-side token emissions for MOVR, xcKSM, and FRAX markets on Moonriver. Supply emissions will be set to 0 while borrow emissions will be set to 1 wei per second. This applies to both WELL token rewards and native MOVR rewards.

This action is a follow-up to MIP-R32 which paused minting and borrowing on these markets due to Chainlink oracle deprecation.

## Background

Following MIP-R32's pause of minting (supplying) and borrowing on MOVR, xcKSM, and FRAX markets, it is necessary to also adjust token emissions to reflect the new market state.

With minting paused on these markets:
- Users cannot add new supply positions
- Continuing to emit supply-side rewards would be inefficient
- Existing suppliers will no longer receive emission rewards

With borrowing paused but existing borrow positions remaining:
- Borrow emissions are set to minimal (1 wei/second) to maintain contract functionality
- This prevents complete shutdown while effectively stopping new reward accumulation

## Proposal

This proposal enacts the following changes on **Moonriver** only for the MOVR, xcKSM, and FRAX markets:

### 1. Pause Supply Emissions

Set supply-side emissions to 0 for:
- **WELL token rewards** (governance token)
- **MOVR token rewards** (native token)

### 2. Set Minimal Borrow Emissions

Set borrow-side emissions to 1 wei per second for:
- **WELL token rewards** (governance token)
- **MOVR token rewards** (native token)

This minimal rate effectively stops rewards while maintaining technical compatibility.

## Rationale

Since MIP-R32 paused new supply and borrow activity on these markets, continuing to emit rewards for supply would serve no purpose. Setting supply emissions to 0 prevents wasted token distribution.

Borrow emissions are set to a minimal value (1 wei/second) rather than 0 to:
- Maintain contract state consistency
- Avoid potential edge cases with zero values
- Effectively stop meaningful reward accumulation (1 wei/second is negligible)

This approach aligns with the security-first principles established in MIP-R32 while efficiently managing protocol resources.

## Voting Options

- **Yes** — Pause supply emissions (set to 0) and set borrow emissions to 1 wei/second for MOVR, xcKSM, and FRAX markets.
- **No** — Continue current emission rates despite markets being paused.
- **Abstain** — No preference.

## Technical Implementation

This proposal executes 6 actions through the Moonwell Comptroller:

1. `_setRewardSpeed(GOVTOKEN, MOVR, 0, 1)` - WELL rewards: supply=0, borrow=1
2. `_setRewardSpeed(NATIVE, MOVR, 0, 1)` - MOVR rewards: supply=0, borrow=1
3. `_setRewardSpeed(GOVTOKEN, xcKSM, 0, 1)` - WELL rewards: supply=0, borrow=1
4. `_setRewardSpeed(NATIVE, xcKSM, 0, 1)` - MOVR rewards: supply=0, borrow=1
5. `_setRewardSpeed(GOVTOKEN, FRAX, 0, 1)` - WELL rewards: supply=0, borrow=1
6. `_setRewardSpeed(NATIVE, FRAX, 0, 1)` - MOVR rewards: supply=0, borrow=1

All actions target the Comptroller contract at `0x0b7a0EAA884849c6Af7a129e899536dDDcA4905E`.

### Parameters

- **GOVTOKEN** = 0 (WELL token rewards)
- **NATIVE** = 1 (MOVR token rewards)
- **Supply Speed** = 0 (no supply rewards)
- **Borrow Speed** = 1 wei/second (minimal borrow rewards)

## Testing

The proposal has been thoroughly tested using a fork of Moonriver at block 3,800,000. The test suite validates:

- ✅ Emissions are active before proposal execution
- ✅ Proposal executes successfully through governance
- ✅ Supply emissions are 0 after execution
- ✅ Borrow emissions are 1 after execution
- ✅ All 6 reward speed updates complete successfully

Test location: `test/apollo/mip-r33/`

Run tests with: `npm test -- ./test/apollo/mip-r33/`

## Related Proposals

- **MIP-R32**: Pause Mint/Borrow on Moonriver - Prerequisite proposal that paused market activity
