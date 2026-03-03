export * from '../base-vars'

// Fork block - using a recent Moonriver block
export const FORK_BLOCK = 3_900_000

// RPC URL - use environment variable or fallback to public RPC
export const RPC_URL = process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network'

// Markets to update collateral factors
export const MARKETS_TO_UPDATE = ['xcKSM', 'MOVR', 'FRAX']

// Starting collateral factors (current values)
export const STARTING_COLLATERAL_FACTORS: { [key: string]: number } = {
    'xcKSM': 7.5,
    'MOVR': 7.5,
    'FRAX': 7.5
}

// New collateral factors
export const COLLATERAL_FACTOR_CHANGES: { [key: string]: number } = {
    'xcKSM': 0,
    'MOVR': 0,
    'FRAX': 0
}
