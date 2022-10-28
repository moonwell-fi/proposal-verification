import {ethers} from "ethers";
import {
    assertMarketBorrowIsNOTPaused, assertMarketBorrowIsPaused,
    assertMarketCFIsNonZero, assertMarketCFIsZero, assertMarketRFIsNOTOneHundred, assertMarketRFIsOneHundred,
    assertMarketSupplyingIsNOTPaused, assertMarketSupplyingIsPaused, assertTransferGuardianIsNotPaused
} from "../../src/verification/assertions";

import {ContractBundle} from "@moonwell-fi/moonwell.js";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting markets are in an expected state AFTER gov proposal passed")

    for (const [displayTicker, market] of Object.entries(contracts.MARKETS)){
        if (['FRAX', 'GLMR', 'xcDOT'].includes(market.assetTicker)){
            // Borrowing is NOT paused
            await assertMarketBorrowIsNOTPaused(provider, contracts, market)
            // Supplying is still NOT Paused
            await assertMarketSupplyingIsNOTPaused(provider, contracts, market)
            // CF != 0%
            await assertMarketCFIsNonZero(provider, contracts, market)
            // RF != 100%
            await assertMarketRFIsNOTOneHundred(provider, contracts, market)
        } else {
            // Borrowing IS still paused
            await assertMarketBorrowIsPaused(provider, contracts, market)
            // Supplying IS still paused
            await assertMarketSupplyingIsPaused(provider, contracts, market)
            // CF == 0%
            await assertMarketCFIsZero(provider, contracts, market)
            // RF == 100%
            await assertMarketRFIsOneHundred(provider, contracts, market)
        }
    }

    await assertTransferGuardianIsNotPaused(provider, contracts)
}