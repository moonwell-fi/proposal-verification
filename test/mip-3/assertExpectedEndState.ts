import {ethers} from "ethers";
import {
  assertMarketIsListed,
  assertChainlinkFeedIsRegistered
  // assertTimelockIsAdminOfMarket,

  // assertChainlinkFeedIsNotRegistered,
  //   assertDexRewarderRewardsPerSec, assertMarketIsNotListed, assertMarketWellRewardSpeed,
  //   assertRoundedWellBalance,
  //   assertSTKWellEmissionsPerSecond
} from "../../src/verification/assertions";
import BigNumber from "bignumber.js";
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

    // await assertTimelockIsAdminOfMarket(contracts, provider, marketAddress)

    // await assertStorageValue('underlying', tokenAddress)
    // await assertStorageValue('name', mTokenName)
    // await assertStorageValue('symbol', mTokenSymbol)

    // await assertReserveFactor(contracts, provider, marketAddress, reserveFactor)
    // await assertProtocolSeizeShare(contracts, provider, marketAddress, protocolSeizeShare)
    // await assertCollateralFactor(contracts, provider, marketAddress, collateralFactor)

    // await assertMarketIsListed(provider, contracts, tokenAddress, expectedMarketAddress)
    await assertChainlinkFeedIsRegistered(provider, contracts, tokenSymbol, chainlinkFeedAddress)
}
