import {ethers} from "ethers";
import { _ } from 'lodash'
import {
    assertMarketBorrowIsNOTPaused, assertMarketBorrowIsPaused,
    assertMarketCFIsNonZero, assertMarketCFIsZero, assertMarketRFIsNOTOneHundred, assertMarketRFIsOneHundred,
    assertMarketSupplyingIsNOTPaused, assertMarketSupplyingIsPaused, assertTransferGuardianIsNotPaused
} from "../../src/verification/assertions";

import {ContractBundle, Market} from "@moonwell-fi/moonwell.js";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting markets are in an expected state AFTER gov proposal passed")

    const ACTIVE_MARKETS_AT_THIS_BLOCK: {[ticker: string]: Market} = _.pickBy(
        contracts.MARKETS,
        ['FRAX', 'GLMR', 'xcDOT', 'USDC.mad', 'ETH.mad', 'BTC.mad']
    )

    for (const [displayTicker, market] of Object.entries(ACTIVE_MARKETS_AT_THIS_BLOCK)){
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