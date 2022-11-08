import {ethers} from "ethers";
import {
    assertDexRewarderRewardsPerSec,
    assertSTKWellEmissionsPerSecond
} from "../../src/verification/assertions";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE, ENDING_MARKET_REWARDS_STATE,
    EXPECTED_STARTING_WELL_HOLDINGS, F_GLMR_LM,
    SENDAMTS,
} from "./vars";
import {SUBMITTER_WALLET} from "./vars";
import {
    assertEndingExpectedGovTokenHoldings,
    assertMarketRewardState
} from "../../src";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    await assertEndingExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_WELL_HOLDINGS,
        SENDAMTS,
        {ECOSYSTEM_RESERVE, F_GLMR_LM, SUBMITTER_WALLET}
    )

    await assertDexRewarderRewardsPerSec(contracts, provider,
        15,
        7,
        new BigNumber('2.086672008547010000').times(1e18)
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('2.086672008547010000').times(1e18)
    )

    await assertMarketRewardState(
        contracts, provider, ENDING_MARKET_REWARDS_STATE
    )
}