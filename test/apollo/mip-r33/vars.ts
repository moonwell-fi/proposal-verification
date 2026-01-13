import {MarketRewardMap, REWARD_TYPES} from "../../../src";
import BigNumber from "bignumber.js";

export * from '../base-vars'

// Fork block - use a recent block for testing
// Old block 3,800,000 is from March 2023 - xcKSM oracle fails there
// Current block ~14,094,000 (November 2025) - xcKSM oracle works
export const FORK_BLOCK = 14_090_000

// RPC URL - use environment variable or fallback to public RPC
export const RPC_URL = process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network'

// Markets to pause emissions for
export const MARKETS_TO_PAUSE = ['MOVR', 'xcKSM', 'FRAX']

// Starting state - emission rates at block 14,090,000
// Note: Borrow emissions are already at 1 wei/sec (from a previous proposal)
// Supply emissions are still active and will be set to 0
export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'MOVR': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.593842788938492063").times(1e18),
            expectedBorrow: new BigNumber("0.000000000000000001").times(1e18),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.00029985119047619").times(1e18),
            expectedBorrow: new BigNumber("0.000000000000000001").times(1e18),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.26494524429563492").times(1e18),
            expectedBorrow: new BigNumber("0.000000000000000001").times(1e18),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000133779761904761").times(1e18),
            expectedBorrow: new BigNumber("0.000000000000000001").times(1e18),
        },
    },
    'FRAX': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.05481625744047619").times(1e18),
            expectedBorrow: new BigNumber("0.000000000000000001").times(1e18),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000027678571428571").times(1e18),
            expectedBorrow: new BigNumber("0.000000000000000001").times(1e18),
        },
    },
}

// Ending state - supply emissions paused (0), borrow emissions set to 1
export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'MOVR': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0"),
            expectedBorrow: new BigNumber("1"),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0"),
            expectedBorrow: new BigNumber("1"),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0"),
            expectedBorrow: new BigNumber("1"),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0"),
            expectedBorrow: new BigNumber("1"),
        },
    },
    'FRAX': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0"),
            expectedBorrow: new BigNumber("1"),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0"),
            expectedBorrow: new BigNumber("1"),
        },
    },
}

// Collateral factor changes - new collateral factors for each market
// Current values: MOVR=60%, xcKSM=59%, FRAX=50%
// Target values: xcKSM=50%, MOVR=50%, FRAX=40%
export const COLLATERAL_FACTOR_CHANGES: { [market: string]: number } = {
    'xcKSM': 50,  // 50% (down from 59%)
    'MOVR': 50,   // 50% (down from 60%)
    'FRAX': 40,   // 40% (down from 50%)
}
