import {MarketRewardMap, REWARD_TYPES} from "../../../src";
import BigNumber from "bignumber.js";

export * from '../base-vars'

export const SUBMITTER_WALLET = '0x87E1e08eDAfD16346d8328e2CF260ff8Bdad9e84'

export const EXPECTED_STARTING_MFAM_HOLDINGS = {
    F_MOVR_GRANT:  130_880_404,
    ECOSYSTEM_RESERVE: 7_612_195,
    COMPTROLLER: 4_906_198,
    DEX_REWARDER: 8_165_379,
    SUBMITTER_WALLET: 0,
}

export const SENDAMTS = {
    ECOSYSTEM_RESERVE: 5_140_101,
    COMPTROLLER: 4_672_818,
    DEX_REWARDER: 5_763_144,
    SUBMITTER_WALLET: 100_000,
}

SENDAMTS['F_MOVR_GRANT'] = -1 * (
    SENDAMTS['ECOSYSTEM_RESERVE'] + SENDAMTS['COMPTROLLER'] + SENDAMTS['DEX_REWARDER'] + SENDAMTS['SUBMITTER_WALLET']
)

// Taken from MIP-27
export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'MOVR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000160017361111111").times(1e18),
            expectedBorrow: new BigNumber("0.000373373842592592").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.126388888888888888").times(1e18),
            expectedBorrow: new BigNumber("0.294907407407407407").times(1e18),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000164120370370370").times(1e18),
            expectedBorrow: new BigNumber("0.000164120370370370").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.137731481481481481").times(1e18),
            expectedBorrow: new BigNumber("0.137731481481481481").times(1e18), // what
        },
    },
    'ETH.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000172326388888888").times(1e18),
            expectedBorrow: new BigNumber("0.000402094907407407").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.078993055555555555").times(1e18),
            expectedBorrow: new BigNumber("0.326099537037037037").times(1e18),
        },
    },
    'USDC.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000455434027777777").times(1e18),
            expectedBorrow: new BigNumber("0.001062679398148148").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.361666666666666666").times(1e18),
            expectedBorrow: new BigNumber("0.805000000000000000").times(1e18),
        },
    },
    'USDT.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000098472222222222").times(1e18),
            expectedBorrow: new BigNumber("0.000229768518518518").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.081018518518518518").times(1e18),
            expectedBorrow: new BigNumber("0.243055555555555555").times(1e18),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000246180555555555").times(1e18),
            expectedBorrow: new BigNumber("0.000574421296296296").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.194444444444444444").times(1e18),
            expectedBorrow: new BigNumber("0.453703703703703703").times(1e18),
        },
    },
}

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'USDC.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.002010474537037037").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.946461857638888888").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'ETH.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000861631944444444").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.405626510416666666").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'MOVR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000492361111111111").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.231786577380952380").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000287210648148148").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.135208836805555555").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'USDT.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000164120370370370").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.077262192460317460").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000287210648148148").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.135208836805555555").times(1e18),
            expectedBorrow: new BigNumber(1),
        },
    },
}