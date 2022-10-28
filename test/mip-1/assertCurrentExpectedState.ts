import {ethers} from "ethers";
import {
    assertMarketBorrowIsPaused,
    assertMarketCFIsNonZero,
    assertMarketRFIsNOTOneHundred,
    assertMarketSupplyingIsNOTPaused,
    assertMarketSupplyingIsPaused,
    assertTransferGuardianPaused,
} from "../../src/verification/assertions";

import {ContractBundle} from "@moonwell-fi/moonwell.js";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    for (const [displayTicker, market] of Object.entries(contracts.MARKETS)){
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