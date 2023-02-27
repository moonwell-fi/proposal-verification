import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {assertCF, assertMarketRF} from "../../../src/verification/assertions";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    // Ensure that xcDOT's CF is now 64%
    await assertCF(
        provider, contracts,
        contracts.MARKETS['xcDOT'].mTokenAddress,
        64
    )

    // Ensure the market's RF is set to 25%
    await assertMarketRF(
        provider,
        contracts.MARKETS['xcDOT'].mTokenAddress,
        25
    )
}