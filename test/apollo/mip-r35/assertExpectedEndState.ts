import {ethers} from "ethers";
import {assertMarketCFEqualsPercent} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {COLLATERAL_FACTOR_CHANGES} from "./vars";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting collateral factors are updated AFTER gov proposal passed")

    // Assert that the markets have updated collateral factors after the proposal
    for (const [ticker, expectedCF] of Object.entries(COLLATERAL_FACTOR_CHANGES)) {
        const market = contracts.MARKETS[ticker]
        if (market) {
            await assertMarketCFEqualsPercent(provider, contracts, market, expectedCF)
        }
    }

    console.log("[+] ✅ All collateral factors are updated after proposal")
}
