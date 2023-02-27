import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {assertCF, assertMarketRF} from "../../../src/verification/assertions";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    // Ensure that xcDOT's CF is still 62% (should've been set to 64%)
    await assertCF(
        provider, contracts,
        contracts.MARKETS['xcDOT'].mTokenAddress,
        62
    )

    // Ensure the market's RF is set to 64% (accidentally)
    await assertMarketRF(
        provider,
        contracts.MARKETS['xcDOT'].mTokenAddress,
        64
    )
}
