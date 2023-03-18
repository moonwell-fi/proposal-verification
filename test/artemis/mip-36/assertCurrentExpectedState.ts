import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    EXPECTED_STARTING_WELL_HOLDINGS,
    F_GLMR_LM,
    SUBMITTER_WALLET,
} from "./vars";
import {assertCurrentExpectedGovTokenHoldings, assertMarketRewardState} from "../../../src";
import {ENDING_MARKET_REWARDS_STATE as MIP28EndRewardsState} from "../mip-28/vars";
import {assertDexRewarderRewardsPerSec, assertSTKWellEmissionsPerSecond} from "../../../src/verification/assertions";
import BigNumber from "bignumber.js";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    await assertCurrentExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_WELL_HOLDINGS,
        {SUBMITTER_WALLET, F_GLMR_LM}
    )

    await assertDexRewarderRewardsPerSec(contracts, provider,
        15,
        10,
        new BigNumber('1.490480737433862433').times(1e18)
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('2.504006250000000000').times(1e18),
        'WELL'
    )

    // Assert current borrow/supply emissions
    await assertMarketRewardState(
        contracts, provider, MIP28EndRewardsState,
    )
}
