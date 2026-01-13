export * from '../base-vars'

// Fork block - use a recent block
export const FORK_BLOCK = 14_100_000

// RPC URL - use environment variable or fallback to public RPC
export const RPC_URL = process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network'

// Starting collateral factors (current on-chain values)
export const STARTING_COLLATERAL_FACTORS: { [market: string]: number } = {
    'xcKSM': 15,
    'MOVR': 15,
    'FRAX': 14,
}

// Collateral factor changes - new collateral factors for each market
export const COLLATERAL_FACTOR_CHANGES: { [market: string]: number } = {
    'xcKSM': 7.5,
    'MOVR': 7.5,
    'FRAX': 7.5,
}
