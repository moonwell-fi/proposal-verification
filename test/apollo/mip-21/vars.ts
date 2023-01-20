import {MarketRewardMap, REWARD_TYPES} from "../../../src";
import BigNumber from "bignumber.js";

export * from '../base-vars'

export const SUBMITTER_WALLET = '0x87E1e08eDAfD16346d8328e2CF260ff8Bdad9e84'

export const EXPECTED_STARTING_MFAM_HOLDINGS = {
    F_MOVR_GRANT:  201_926_440,
    ECOSYSTEM_RESERVE: 6_634_015,
    COMPTROLLER: 4_741_340,
    DEX_REWARDER: 8_948_521,
    SUBMITTER_WALLET: 0,
}

export const SENDAMTS = {
    ECOSYSTEM_RESERVE: 6_928_856,
    COMPTROLLER: 7_820_000,
    DEX_REWARDER: 13_362_793,
    SUBMITTER_WALLET: 100_000,
}

SENDAMTS['F_MOVR_GRANT'] = -1 * (
    SENDAMTS['ECOSYSTEM_RESERVE'] + SENDAMTS['COMPTROLLER'] + SENDAMTS['DEX_REWARDER'] + SENDAMTS['SUBMITTER_WALLET']
)

// Taken from MIP-9
export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'MOVR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000320034722222222").times(1e18),
            expectedBorrow: new BigNumber("0.000746747685185185").times(1e18),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000328240740740741").times(1e18),
            expectedBorrow: new BigNumber("0.000328240740740741").times(1e18),
        },
    },
    'ETH.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000344652777777778").times(1e18),
            expectedBorrow: new BigNumber("0.000804189814814815").times(1e18),
        },
    },
    'USDC.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000861631944444445").times(1e18),
            expectedBorrow: new BigNumber("0.002010474537037040").times(1e18),
        },
    },
    'USDT.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000246180555555556").times(1e18),
            expectedBorrow: new BigNumber("0.000574421296296296").times(1e18),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000492361111111111").times(1e18),
            expectedBorrow: new BigNumber("0.001148842592592590").times(1e18),
        },
    },
}

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'MOVR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000160017361111111").times(1e18),
            expectedBorrow: new BigNumber("0.000373373842592593").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.127893518518519000").times(1e18),
            expectedBorrow: new BigNumber("0.300925925925926000").times(1e18),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000164120370370370").times(1e18),
            expectedBorrow: new BigNumber("0.000164120370370370").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.230902777777778000").times(1e18),
            expectedBorrow: new BigNumber("0.131944444444444000").times(1e18),
        },
    },
    'ETH.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000172326388888889").times(1e18),
            expectedBorrow: new BigNumber("0.000402094907407407").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.078703703703703700").times(1e18),
            expectedBorrow: new BigNumber("0.324074074074074000").times(1e18),
        },
    },
    'USDC.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000455434027777778").times(1e18),
            expectedBorrow: new BigNumber("0.001062679398148150").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.364004629629630000").times(1e18),
            expectedBorrow: new BigNumber("0.810185185185185000").times(1e18),
        },
    },
    'USDT.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000098472222222222").times(1e18),
            expectedBorrow: new BigNumber("0.000229768518518519").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.078703703703703700").times(1e18),
            expectedBorrow: new BigNumber("0.231481481481481000").times(1e18),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000246180555555556").times(1e18),
            expectedBorrow: new BigNumber("0.000574421296296296").times(1e18),
        },
        [REWARD_TYPES.GOVTOKEN]: {
            expectedSupply: new BigNumber("0.196759259259259000").times(1e18),
            expectedBorrow: new BigNumber("0.462962962962963000").times(1e18),
        },
    },
}