import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    SENDAMTS,
} from "./vars";
import {SUBMITTER_WALLET} from "./vars";
import {
    assertMarketRewardState,
} from "../../../src";
import {
    assertDexRewarderRewardsPerSec,
    assertRoundedWellBalance,
    assertSTKWellEmissionsPerSecond
} from "../../../src/verification/assertions";
import {ENDING_MARKET_REWARDS_STATE} from "./vars";
import BigNumber from "bignumber.js";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    await assertRoundedWellBalance(contracts, provider,
        SUBMITTER_WALLET,
        'SUBMITTER_WALLET',
        SENDAMTS['SUBMITTER_WALLET']
    )

    await assertMarketRewardState(
        contracts, provider, ENDING_MARKET_REWARDS_STATE,
    )

    await assertDexRewarderRewardsPerSec(contracts, provider,
        15,
        11,
        new BigNumber('1.192385085978835978').times(1e18)
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('2.682863839285714285').times(1e18),
        'WELL'
    )
}