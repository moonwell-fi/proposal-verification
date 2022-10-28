import {ethers} from "ethers";
import {
    assertDexRewarderRewardsPerSec, assertMarketGovTokenRewardSpeed,
    assertRoundedWellBalance,
    assertSTKWellEmissionsPerSecond
} from "../../src/verification/assertions";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    DEX_REWARDER,
    ECOSYSTEM_RESERVE,
    EXPECTED_STARTING_WELL_HOLDINGS, F_GLMR_LM, STARTING_MARKET_REWARDS_STATE, SUBMITTER_WALLET,
} from "./vars";
import {assertCurrentExpectedGovTokenHoldings, assertMarketRewardState} from "../../src";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    await assertCurrentExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_WELL_HOLDINGS,
        {ECOSYSTEM_RESERVE, DEX_REWARDER, F_GLMR_LM, SUBMITTER_WALLET}
    )

    // Assert current reward speeds
    await assertDexRewarderRewardsPerSec(DEX_REWARDER, provider,
        15,
        6,
        new BigNumber('2.265529609279610000').times(1e18)
    )

    // Assert current WELL emissions
    await assertSTKWellEmissionsPerSecond(contracts.SAFETY_MODULE, provider,
        new BigNumber('1.728956807081810000').times(1e18)
    )

    await assertMarketRewardState(
        contracts, provider, STARTING_MARKET_REWARDS_STATE
    )
}
