import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import { assertLiquidationsIsPaused, assertMarketBorrowIsPaused, assertCF } from '../../src/verification/assertions'

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, expectedUSDCCollateralFactor: number){
    // Global liquidations are paused
    await assertLiquidationsIsPaused(provider, contracts)

    // Each market is also paused.
    const markets = Object.keys(contracts.MARKETS)
    for (let i = 0; i < markets.length; i++) {
        const market = contracts.MARKETS[markets[i]]
        await assertMarketBorrowIsPaused(provider, contracts, market)
    }

    // Assert that the collateral factor on USDC is as expected
    const usdcMarketAddress = contracts.MARKETS['USDC.multi'].mTokenAddress
    assertCF(
        provider, 
        contracts, 
        usdcMarketAddress,
        expectedUSDCCollateralFactor,
    )
}
