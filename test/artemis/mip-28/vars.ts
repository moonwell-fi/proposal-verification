import {MarketRewardMap, REWARD_TYPES, TokenHoldingsMap} from "../../../src";
import BigNumber from "bignumber.js";

export const ECOSYSTEM_RESERVE = '0x7793E08Eb4525309C46C9BA394cE33361A167ba4'
export const F_GLMR_LM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
export const C_GLMR_APPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

export const SUBMITTER_WALLET = '0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5'

export const EXPECTED_STARTING_WELL_HOLDINGS : TokenHoldingsMap = {
    F_GLMR_LM: 810_589_784,
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

export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'GLMR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.051669973544973600").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.447144001831502000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcDOT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.045469576719576700").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.393486721611722000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.043402777777777800").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.375600961538462000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'ETH.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.012400793650793700").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.107314560439560000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'BTC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.028935185185185200").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.250400641025641000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'USDC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.016534391534391500").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.143086080586081000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'BUSD.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.008267195767195770").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.071543040293040300").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcUSDT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber(0),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber(0),
            expectedBorrow: new BigNumber(1),
        },
    },
}

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'GLMR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.049603174603174603").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.472184035714285714").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcDOT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.041335978835978835").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.393486696428571428").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcUSDT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.008267195767195767").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.078697339285714285").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.037202380952380952").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.354138026785714285").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'ETH.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.020667989417989417").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.196743348214285714").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'BTC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.028935185185185185").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.275440687500000000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'USDC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.020667989417989417").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.196743348214285714").times(1e18),
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