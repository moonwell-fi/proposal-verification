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

    await assertEndingExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_MFAM_HOLDINGS,
        SENDAMTS,
        {ECOSYSTEM_RESERVE, F_MOVR_GRANT, SUBMITTER_WALLET}
    )

    await assertDexRewarderRewardsPerSec(contracts, provider,
        11,
        26,
        new BigNumber('2.382251984126984126').times(1e18),
        "MFAM"
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('2.124710292658730158').times(1e18)
    )

    await assertMarketRewardState(
        contracts, provider, ENDING_MARKET_REWARDS_STATE
    )
}