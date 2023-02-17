import {MarketRewardMap, REWARD_TYPES} from "../../../src";
import BigNumber from "bignumber.js";

export * from '../base-vars'

export const SUBMITTER_WALLET = '0x87E1e08eDAfD16346d8328e2CF260ff8Bdad9e84'

export const EXPECTED_STARTING_MFAM_HOLDINGS = {
    F_MOVR_GRANT:  170_169_988,
    ECOSYSTEM_RESERVE: 7_394_135,
    COMPTROLLER: 4_008_592,
    DEX_REWARDER: 7_686_617,
    SUBMITTER_WALLET: 0,
}

export const SENDAMTS = {
    ECOSYSTEM_RESERVE: 6_440_001,
    COMPTROLLER: 7_840_000,
    DEX_REWARDER: 13_720_002,
    SUBMITTER_WALLET: 100_000,
}

SENDAMTS['F_MOVR_GRANT'] = -1 * (
    SENDAMTS['ECOSYSTEM_RESERVE'] + SENDAMTS['COMPTROLLER'] + SENDAMTS['DEX_REWARDER'] + SENDAMTS['SUBMITTER_WALLET']
)

// Taken from MIP-9
export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
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
            expectedSupply: new BigNumber("0.137731481481481000").times(1e18),
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

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
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