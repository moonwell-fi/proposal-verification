import {MarketRewardMap, REWARD_TYPES, TokenHoldingsMap} from "../../../src";
import BigNumber from "bignumber.js";

export const ECOSYSTEM_RESERVE = '0x7793E08Eb4525309C46C9BA394cE33361A167ba4'
export const F_GLMR_LM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
export const C_GLMR_APPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

export const SUBMITTER_WALLET = '0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5'

export const EXPECTED_STARTING_WELL_HOLDINGS : TokenHoldingsMap = {
    F_GLMR_LM: 796_066_704,
    SUBMITTER_WALLET: 0,
}

export const SENDAMTS = {
    DEX_REWARDER: 4_038_462,
    COMPTROLLER: 4_326_924,
    ECOSYSTEM_RESERVE: 6_057_693,
    SUBMITTER_WALLET: 100_000,
}

// Send amounts should be negative for F_GLMR_LM
SENDAMTS['F_GLMR_LM'] = -1 * (SENDAMTS['SUBMITTER_WALLET'])

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'GLMR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.054050223214285714").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.626001562500000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcDOT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.036033482142857142").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.417334375000000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcUSDT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.007206696428571428").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.083466875000000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.028826785714285714").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.333867500000000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'ETH.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.021620089285714285").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.250400625000000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'BTC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.014413392857142857").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.166933750000000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'USDC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.018016741071428571").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.208667187500000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'BUSD.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber(1),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber(1),
            expectedBorrow: new BigNumber(1),
        },
    },
}