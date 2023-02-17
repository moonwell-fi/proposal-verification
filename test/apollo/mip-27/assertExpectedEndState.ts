import {ethers} from "ethers";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    SUBMITTER_WALLET, ECOSYSTEM_RESERVE, ENDING_MARKET_REWARDS_STATE, EXPECTED_STARTING_MFAM_HOLDINGS, F_MOVR_GRANT, SENDAMTS
} from "./vars";
import {
    assertEndingExpectedGovTokenHoldings,
    assertMarketRewardState
} from "../../../src";
import {assertDexRewarderRewardsPerSec, assertSTKWellEmissionsPerSecond} from "../../../src/verification/assertions";
import BigNumber from "bignumber.js";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    // // Compensate for a rounding issue with reward puller
    // const fixedSendAmts = JSON.parse(JSON.stringify(SENDAMTS))
    // fixedSendAmts['DEX_REWARDER'] -= 1

    await assertEndingExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_MFAM_HOLDINGS,
        SENDAMTS,
        {ECOSYSTEM_RESERVE, F_MOVR_GRANT, SUBMITTER_WALLET}
    )

    await assertDexRewarderRewardsPerSec(contracts, provider,
        11,
        25,
        new BigNumber('5.671297123015873015').times(1e18),
        "MFAM"
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('2.662037037037037037').times(1e18)
    )

    await assertMarketRewardState(
        contracts, provider, ENDING_MARKET_REWARDS_STATE
    )
}