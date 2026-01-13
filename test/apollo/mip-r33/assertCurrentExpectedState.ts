import {ethers} from "ethers";
import {assertMarketRewardState, assertMarketCFIsNonZero} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {STARTING_MARKET_REWARDS_STATE, MARKETS_TO_PAUSE} from "./vars";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting emission rates are in expected state BEFORE gov proposal passes")

    // Assert that the markets have active emissions before the proposal
    await assertMarketRewardState(contracts, provider, STARTING_MARKET_REWARDS_STATE)

    console.log("[+] ✅ All emission rates are in expected state before proposal")

    console.log("[+] Asserting collateral factors are non-zero BEFORE gov proposal passes")

    // Assert that the markets have non-zero collateral factors before the proposal
    for (const ticker of MARKETS_TO_PAUSE) {
        const market = Object.values(contracts.MARKETS).find(m => m.assetTicker === ticker)
        if (market) {
            await assertMarketCFIsNonZero(provider, contracts, market)
        }
    }

    console.log("[+] ✅ All collateral factors are non-zero before proposal")
}
