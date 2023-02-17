import {ethers} from "ethers";
import {
    assertDexRewarderRewardsPerSec,
    assertSTKWellEmissionsPerSecond
} from "../../../src/verification/assertions";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE,
    SUBMITTER_WALLET,
    EXPECTED_STARTING_MFAM_HOLDINGS, F_MOVR_GRANT, STARTING_MARKET_REWARDS_STATE
} from "./vars";

import {assertCurrentExpectedGovTokenHoldings, assertMarketRewardState} from "../../../src";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    await assertCurrentExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_MFAM_HOLDINGS,
        {ECOSYSTEM_RESERVE, F_MOVR_GRANT, SUBMITTER_WALLET}
    )

    // Assert current reward speeds
    await assertDexRewarderRewardsPerSec(contracts, provider,
        11,
        23,
        new BigNumber('5.284965330627430000').times(1e18),
        "MFAM"
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('2.864110243694870000').times(1e18)
    )

    // Assert current borrow/supply emissions
    await assertMarketRewardState(
        contracts, provider, STARTING_MARKET_REWARDS_STATE
    )
}
