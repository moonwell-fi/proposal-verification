import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    EXTRA_MARKET_ADDRESSES,
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

    // TODO: Add non-market reward speed adjustments

    await assertMarketRewardState(
        contracts, provider, ENDING_MARKET_REWARDS_STATE,
        EXTRA_MARKET_ADDRESSES
    )

    await assertDexRewarderRewardsPerSec(contracts, provider,
        15,
        9,
        new BigNumber('1.669337606837610000').times(1e18)
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('2.504006410256410000').times(1e18),
        'WELL'
    )
}