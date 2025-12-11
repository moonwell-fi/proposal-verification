import {ethers} from "ethers";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {STARTING_COLLATERAL_FACTORS} from "./vars";
import BigNumber from "bignumber.js";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting collateral factors are in expected state BEFORE gov proposal passes")

    const comptroller = contracts.COMPTROLLER.contract.connect(provider)

    // Assert that the markets have the expected collateral factors before the proposal
    for (const [ticker, expectedCF] of Object.entries(STARTING_COLLATERAL_FACTORS)) {
        const market = contracts.MARKETS[ticker]
        if (market) {
            const marketData = await comptroller.markets(market.mTokenAddress)
            const cfMantissa = new BigNumber(marketData.collateralFactorMantissa.toString())
            const cfPercent = cfMantissa.div(1e18).times(100).toNumber()

            if (Math.abs(cfPercent - expectedCF) > 0.01) {
                throw new Error(`${ticker} CF expected ${expectedCF}% but found ${cfPercent}%`)
            }
            console.log(`    ✅ ${ticker} Collateral Factor is ${cfPercent}%`)
        }
    }

    console.log("[+] ✅ All collateral factors are in expected state before proposal")
}
