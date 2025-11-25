import {MarketRewardMap, REWARD_TYPES} from "../../../src";
import BigNumber from "bignumber.js";

export * from '../base-vars'

// Fork block - using same block as MIP-R32 for consistency
export const FORK_BLOCK = 3_800_000

// RPC URL - use environment variable or fallback to public RPC
export const RPC_URL = process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network'

// Markets to pause emissions for
export const MARKETS_TO_PAUSE = ['MOVR', 'xcKSM', 'FRAX']

// Starting state - markets should have active emissions before the proposal
export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'MOVR': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.126388888888888888").times(1e18),
            expectedBorrow: new BigNumber("0.294907407407407407").times(1e18),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000160017361111111").times(1e18),
            expectedBorrow: new BigNumber("0.000373373842592592").times(1e18),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.137731481481481481").times(1e18),
            expectedBorrow: new BigNumber("0.137731481481481481").times(1e18),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000164120370370370").times(1e18),
            expectedBorrow: new BigNumber("0.000164120370370370").times(1e18),
        },
    },
    'FRAX': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.194444444444444444").times(1e18),
            expectedBorrow: new BigNumber("0.453703703703703703").times(1e18),
        },
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000246180555555555").times(1e18),
            expectedBorrow: new BigNumber("0.000574421296296296").times(1e18),
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
