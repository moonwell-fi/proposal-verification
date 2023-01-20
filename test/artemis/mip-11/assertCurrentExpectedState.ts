import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    EXPECTED_STARTING_WELL_HOLDINGS,
    F_GLMR_LM,
    SUBMITTER_WALLET,
} from "./vars";
import {assertCurrentExpectedGovTokenHoldings, assertMarketRewardState} from "../../../src";
import {STARTING_MARKET_REWARDS_STATE} from "./vars";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    await assertCurrentExpectedGovTokenHoldings(
        contracts,
        provider,
        EXPECTED_STARTING_WELL_HOLDINGS,
        {SUBMITTER_WALLET, F_GLMR_LM}
    )

    // Assert current borrow/supply emissions
    await assertMarketRewardState(
        contracts, provider, STARTING_MARKET_REWARDS_STATE
    )
}
