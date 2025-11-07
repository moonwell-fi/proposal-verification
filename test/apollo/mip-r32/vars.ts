export * from '../base-vars'

// Fork block - using a recent Moonriver block before oracle deprecation
export const FORK_BLOCK = 3_800_000

// RPC URL - use environment variable or fallback to public RPC
export const RPC_URL = process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network'

// Markets to pause
export const MARKETS_TO_PAUSE = ['MOVR', 'xcKSM', 'FRAX']
