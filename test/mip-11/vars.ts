import {MarketRewardMap, REWARD_TYPES, TokenHoldingsMap} from "../../src";
import BigNumber from "bignumber.js";

export const ECOSYSTEM_RESERVE = '0x7793E08Eb4525309C46C9BA394cE33361A167ba4'
export const F_GLMR_LM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
export const C_GLMR_APPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

export const SUBMITTER_WALLET = '0x2c4578032aa885C9b4c1Da15e6738D5A0AFb56C4'

export const EXPECTED_STARTING_WELL_HOLDINGS : TokenHoldingsMap = {
    F_GLMR_LM: 825_212_863,
    SUBMITTER_WALLET: 0,
}

export const SENDAMTS = {
    SUBMITTER_WALLET: 100_000,
}

// Send amounts should be negative for F_GLMR_LM
SENDAMTS['F_GLMR_LM'] = -1 * (SENDAMTS['SUBMITTER_WALLET'])

/*

GLMR Reward Speeds (pending)
Set new reward speeds on GLMR to match adjustments:
    GLMR:
        Supply: 43919477513227500
        Borrow: 1
    xcDOT:
        Supply: 43919477513227500
        Borrow: 1
    FRAX:
        Supply: 45676256613756600
        Borrow: 1
    ETH:
        Supply: 14054232804232800
        Borrow: 1
    BTC:
        Supply: 14054232804232800
        Borrow: 1
    USDC:
        Supply: 14054232804232800
        Borrow: 1
WELL Reward Speeds (pending)
Set new reward speeds on WELL to match adjustments:
    GLMR:
        Supply: 447144001831502000
        Borrow: 1
    xcDOT:
        Supply: 447144001831502000
        Borrow: 1
    ETH:
        Supply: 143086080586081000
        Borrow: 1
    BTC:
        Supply: 143086080586081000
        Borrow: 1
    FRAX:
        Supply: 465029761904762000
        Borrow: 1
    USDC:
        Supply: 143086080586081000
        Borrow: 1

 */

export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'GLMR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.050586771763392900").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.590230082417583000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcDOT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.053652636718750000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.608115842490843000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.049053839285714300").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.590230082417583000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
}

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'GLMR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.043919477513227500").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.447144001831502000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcDOT': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.045676256613756600").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.447144001831502000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.043919477513227500").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.465029761904762000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'ETH.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.014054232804232800").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.143086080586081000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'BTC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.014054232804232800").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.143086080586081000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'USDC.wh': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.014054232804232800").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.143086080586081000").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
}