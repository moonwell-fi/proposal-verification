import {ethers} from "ethers";
import {
    assertMarketBorrowIsNOTPaused,
    assertMarketSupplyingIsNOTPaused
} from "../../../src/verification/assertions";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {MARKETS_TO_PAUSE} from "./vars";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting markets are in expected state BEFORE gov proposal passes")

    // Get the markets that will be paused
    const marketsToPause = Object.values(contracts.MARKETS).filter(
        m => MARKETS_TO_PAUSE.includes(m.assetTicker)
    )

    // Assert that borrowing and supplying are NOT paused before the proposal
    for (const market of marketsToPause){
        console.log(`[+] Asserting ${market.assetTicker} borrowing is NOT paused`)
        await assertMarketBorrowIsNOTPaused(provider, contracts, market)

        console.log(`[+] Asserting ${market.assetTicker} supplying is NOT paused`)
        await assertMarketSupplyingIsNOTPaused(provider, contracts, market)
    }

    console.log("[+] ✅ All markets are in expected state before proposal")
}
