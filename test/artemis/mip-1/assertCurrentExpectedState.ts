import {ethers} from "ethers";
import { _ } from 'lodash';
import {
    assertMarketBorrowIsPaused,
    assertMarketCFIsNonZero,
    assertMarketRFIsNOTOneHundred,
    assertMarketSupplyingIsNOTPaused,
    assertMarketSupplyingIsPaused,
    assertTransferGuardianPaused,
} from "../../../src/verification/assertions";

import {ContractBundle, Market} from "@moonwell-fi/moonwell.js";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    const ACTIVE_MARKETS_AT_THIS_BLOCK: {[ticker: string]: Market} = _.pickBy(
        contracts.MARKETS,
        ['FRAX', 'GLMR', 'xcDOT', 'USDC.mad', 'ETH.mad', 'BTC.mad']
    )

    for (const [displayTicker, market] of Object.entries(ACTIVE_MARKETS_AT_THIS_BLOCK)){
        await assertMarketBorrowIsPaused(provider, contracts, market)

        if (['FRAX', 'GLMR', 'xcDOT'].includes(market.assetTicker)){
            await assertMarketSupplyingIsNOTPaused(provider, contracts, market)
        } else {
            await assertMarketSupplyingIsPaused(provider, contracts, market)
        }

        await assertMarketCFIsNonZero(provider, contracts, market)
        await assertMarketRFIsNOTOneHundred(provider, contracts, market)

        console.log()
    }

    await assertTransferGuardianPaused(provider, contracts)
}