import {ethers} from "ethers";
import {
    assertDexRewarderRewardsPerSec,
    assertSTKWellEmissionsPerSecond
} from "../../../src/verification/assertions";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE,
    EXPECTED_STARTING_WELL_HOLDINGS,
    F_GLMR_LM,
    SUBMITTER_WALLET,
} from "./vars";
import {assertCurrentExpectedGovTokenHoldings} from "../../../src";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    await assertCurrentExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_WELL_HOLDINGS,
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
}
