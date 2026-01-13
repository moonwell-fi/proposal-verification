import {ethers} from "ethers";
import {assertMarketRewardState, assertMarketCFEqualsPercent} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {ENDING_MARKET_REWARDS_STATE, COLLATERAL_FACTOR_CHANGES} from "./vars";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting emission rates are in expected state AFTER gov proposal passed")

    // Assert that the markets have updated emissions after the proposal
    await assertMarketRewardState(contracts, provider, ENDING_MARKET_REWARDS_STATE)

    console.log("[+] ✅ All emission rates are in expected state after proposal")

    console.log("[+] Asserting collateral factors are updated AFTER gov proposal passed")

    // Assert that the markets have updated collateral factors after the proposal
    for (const [ticker, expectedCF] of Object.entries(COLLATERAL_FACTOR_CHANGES)) {
        const market = Object.values(contracts.MARKETS).find(m => m.assetTicker === ticker)
        if (market) {
            await assertMarketCFEqualsPercent(provider, contracts, market, expectedCF)
        }
    }

    console.log("[+] ✅ All collateral factors are updated after proposal")
}
