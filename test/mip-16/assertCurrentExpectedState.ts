import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import { assertLiquidationsArePaused, assertMarketBorrowIsPaused } from '../../src/verification/assertions'

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting system is in a paused state")

    // Global liquidations are paused
    await assertLiquidationsArePaused(provider, contracts)

    // Each market is also paused.
    const markets = Object.keys(contracts.MARKETS)
    for (let i = 0; i < markets.length; i++) {
        const market = contracts.MARKETS[markets[i]]
        await assertMarketBorrowIsPaused(provider, contracts, market)
    }
}
