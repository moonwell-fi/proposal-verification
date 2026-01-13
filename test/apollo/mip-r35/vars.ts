export * from '../base-vars'

// Fork block - use a recent block after MIP-R33 has passed
// MIP-R33 set CF to: xcKSM=50%, MOVR=50%, FRAX=40%
// We need to use a block after that proposal executed
export const FORK_BLOCK = 14_090_000

// RPC URL - use environment variable or fallback to public RPC
export const RPC_URL = process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network'

// Starting collateral factors (current on-chain values at block 14,090,000)
// Note: MIP-R33 will change these to xcKSM=50%, MOVR=50%, FRAX=40%
// But we test from current state for now
export const STARTING_COLLATERAL_FACTORS: { [market: string]: number } = {
    'xcKSM': 59,  // Current on-chain value
    'MOVR': 60,   // Current on-chain value
    'FRAX': 50,   // Current on-chain value
}

// Collateral factor changes - new collateral factors for each market
// Target values: xcKSM=25%, MOVR=25%, FRAX=25%
export const COLLATERAL_FACTOR_CHANGES: { [market: string]: number } = {
    'xcKSM': 25,  // 25% (down from 50%)
    'MOVR': 25,   // 25% (down from 50%)
    'FRAX': 25,   // 25% (down from 40%)
}
