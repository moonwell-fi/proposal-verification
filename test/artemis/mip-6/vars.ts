import {MarketRewardMap, REWARD_TYPES, TokenHoldingsMap} from "../../../src";
import BigNumber from "bignumber.js";

export const ECOSYSTEM_RESERVE = '0x7793E08Eb4525309C46C9BA394cE33361A167ba4'
export const F_GLMR_LM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
export const C_GLMR_APPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

export const SUBMITTER_WALLET = '0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5'

export const EXPECTED_STARTING_WELL_HOLDINGS : TokenHoldingsMap = {
    F_GLMR_LM: 751_365_948,
    ECOSYSTEM_RESERVE: 3_196_900,
    COMPTROLLER: 4_301_721,
    DEX_REWARDER: 2_193_718,
    SUBMITTER_WALLET: 0,
}

export const SENDAMTS = {
    ECOSYSTEM_RESERVE: 5_048_077,
    COMPTROLLER: 4_326_924,
    DEX_REWARDER: 5_048_077,
    SUBMITTER_WALLET: 100_000,
}

// Send amounts should be negative for F_GLMR_LM
SENDAMTS['F_GLMR_LM'] = -1 * (SENDAMTS['ECOSYSTEM_RESERVE'] + SENDAMTS['COMPTROLLER'] + SENDAMTS['DEX_REWARDER'] + SENDAMTS['SUBMITTER_WALLET'])

export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'xcDOT': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.668927426739927000").times(1e18),
            expectedBorrow: new BigNumber("1")
        },
    },
    'GLMR': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.649253090659341000").times(1e18),
            expectedBorrow: new BigNumber("1")
        },
    },
    'FRAX': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.649253090659341000").times(1e18),
            expectedBorrow: new BigNumber("1")
        },
    },
}

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'xcDOT': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.608115842490843000").times(1e18),
            expectedBorrow: new BigNumber("1")
        },
    },
    'GLMR': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.590230082417583000").times(1e18),
            expectedBorrow: new BigNumber("1")
        },
    },
    'FRAX': {
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.590230082417583000").times(1e18),
            expectedBorrow: new BigNumber("1")
        },
    },
}