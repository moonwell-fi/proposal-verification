import {ethers} from "ethers";
import {
    assertMarketBorrowIsPaused,
    assertMarketSupplyingIsPaused
} from "../../../src/verification/assertions";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {MARKETS_TO_PAUSE} from "./vars";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting markets are in expected state AFTER gov proposal passed")

    // Get the markets that should be paused
    const marketsToPause = Object.values(contracts.MARKETS).filter(
        m => MARKETS_TO_PAUSE.includes(m.assetTicker)
    )

    // Assert that borrowing and supplying ARE paused after the proposal
    for (const market of marketsToPause){
        console.log(`[+] Asserting ${market.assetTicker} borrowing IS paused`)
        await assertMarketBorrowIsPaused(provider, contracts, market)

        console.log(`[+] Asserting ${market.assetTicker} supplying IS paused`)
        await assertMarketSupplyingIsPaused(provider, contracts, market)
    }

    console.log("[+] ✅ All markets are in expected state after proposal")
}
