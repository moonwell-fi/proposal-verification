import {MarketRewardMap, REWARD_TYPES} from "../../../src";
import BigNumber from "bignumber.js";

export * from '../base-vars'

export const SUBMITTER_WALLET = '0x87E1e08eDAfD16346d8328e2CF260ff8Bdad9e84'

export const EXPECTED_STARTING_MFAM_HOLDINGS = {
    F_MOVR_GRANT:  274_273_076,
    SUBMITTER_WALLET: 0,
    ECOSYSTEM_RESERVE: 5_372_549,
    COMPTROLLER: 6_440_210,
    DEX_REWARDER: 8_666_069,
}

export const SENDAMTS = {
    ECOSYSTEM_RESERVE: 12_273_973,
    COMPTROLLER: 15_640_000,
    DEX_REWARDER: 25_570_777,
    SUBMITTER_WALLET: 100_000,
}

SENDAMTS['F_MOVR_GRANT'] = -1 * (
    SENDAMTS['ECOSYSTEM_RESERVE'] + SENDAMTS['COMPTROLLER'] + SENDAMTS['DEX_REWARDER'] + SENDAMTS['SUBMITTER_WALLET']
)

export const STARTING_MARKET_REWARDS_STATE : MarketRewardMap = {
    'MOVR': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000384041666666667").times(1e18),
            expectedBorrow: new BigNumber("0.000896097222222222").times(1e18),
        },
    },
    'xcKSM': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000393888888888889").times(1e18),
            expectedBorrow: new BigNumber("0.000393888888888889").times(1e18),
        },
    },
    'ETH.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000413583333333333").times(1e18),
            expectedBorrow: new BigNumber("0.000965027777777778").times(1e18),
        },
    },
    'USDC.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.001033958333333330").times(1e18),
            expectedBorrow: new BigNumber("0.002412569444444440").times(1e18),
        },
    },
    'USDT.multi': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000295416666666667").times(1e18),
            expectedBorrow: new BigNumber("0.000689305555555556").times(1e18),
        },
    },
    'FRAX': {
        [REWARD_TYPES.NATIVE]: {
            expectedSupply: new BigNumber("0.000590833333333333").times(1e18),
            expectedBorrow: new BigNumber("0.001378611111111110").times(1e18),
        },
    },
}

export const ENDING_MARKET_REWARDS_STATE : MarketRewardMap = {
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