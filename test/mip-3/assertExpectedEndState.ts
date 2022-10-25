import {ethers} from "ethers";
import {
  assertMarketIsListed,
  assertChainlinkFeedIsRegistered,
  assertTimelockIsAdminOfMarket,
  assertStorageString,
  assertStorageAddress,
  assertMarketSeizeShare,
  assertMarketRF,
  assertCF,
} from "../../src/verification/assertions";
import {ContractBundle} from "@moonwell-fi/moonwell.js";

export async function assertExpectedEndState(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle, 
  tokenAddress: string,
  chainlinkFeedAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  mTokenName: string,
  mTokenSymbol: string,
  reserveFactoryPercent: number,
  protocolSeizeSharePercent: number,
  collateralFactorPercent: number,
  expectedMarketAddress: string
){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    // Market has the expected values in storage.
    const market = new ethers.Contract(
      expectedMarketAddress,
      require('../../src/abi/MErc20Delegator.json').abi,
      provider
    )
    await assertStorageAddress(market, tokenAddress, 'underlying')
    await assertStorageString(market, mTokenName, 'name')
    await assertStorageString(market, mTokenSymbol, 'symbol')

    // Economic parameters on market are correct
    await assertMarketRF(provider, expectedMarketAddress, reserveFactoryPercent)
    await assertMarketSeizeShare(provider, expectedMarketAddress, protocolSeizeSharePercent)

    // Market is admin'ed correctly by the timelock.
    await assertTimelockIsAdminOfMarket(provider, contracts, expectedMarketAddress)

    // Unitroller has the market listed with the correct collateral factor
    await assertMarketIsListed(provider, contracts, tokenAddress, expectedMarketAddress)
    
    await assertChainlinkFeedIsRegistered(provider, contracts, tokenSymbol, chainlinkFeedAddress)

    await assertCF(provider, contracts, expectedMarketAddress, collateralFactorPercent)
}
