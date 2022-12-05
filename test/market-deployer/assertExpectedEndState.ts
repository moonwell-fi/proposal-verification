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
  assertMTokenProxySetCorrectly,
  assertMTokenProxyByteCodeMatches,
  assertMarketNativeTokenRewardSpeed,
  assertMarketGovTokenRewardSpeed,
  assertBorrowCap
} from "../../src/verification/assertions";
import {ContractBundle, getContract} from "@moonwell-fi/moonwell.js";
import BigNumber from "bignumber.js";

// TODO: Refactor this somewhere global to use in a MIP.
async function assertExpectedStateEndStateForToken(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  tokenAddress: string,
  chainlinkFeedAddress: string,
  tokenSymbol: string,
  mTokenName: string,
  mTokenSymbol: string,
  reserveFactoryPercent: number,
  protocolSeizeSharePercent: number,
  collateralFactorPercent: number,
  borrowCap: number,
  tokenDecimals: number,
  expectedMarketAddress: string
) {
  console.log(`[+] Asserting protocol is in an expected for ${tokenSymbol} state AFTER gov proposal passed`)

  // Market has the expected values in storage.
  const market = getContract('MErc20Delegator', expectedMarketAddress, provider)
  await assertStorageAddress(market, tokenAddress, 'underlying')
  await assertStorageAddress(market, contracts.COMPTROLLER.address, 'comptroller')
  await assertStorageAddress(market, contracts.INTEREST_RATE_MODEL.address, 'interestRateModel')
  await assertStorageAddress(market, ethers.constants.AddressZero, 'pendingAdmin')
  await assertStorageString(market, mTokenName, 'name')
  await assertStorageString(market, mTokenSymbol, 'symbol')

  // Economic parameters on market are correct
  await assertMarketRF(provider, expectedMarketAddress, reserveFactoryPercent)
  await assertMarketSeizeShare(provider, expectedMarketAddress, protocolSeizeSharePercent)

  // Market is admin'ed correctly by the timelock.
  await assertTimelockIsAdminOfMarket(provider, contracts, expectedMarketAddress)

  // Unitroller has the market listed with the correct collateral factor
  await assertMarketIsListed(provider, contracts, tokenAddress, expectedMarketAddress)
  await assertCF(provider, contracts, expectedMarketAddress, collateralFactorPercent)
  await assertBorrowCap(provider, contracts, expectedMarketAddress, borrowCap, tokenDecimals)

  // Assert a chain link feed is registered
  await assertChainlinkFeedIsRegistered(provider, contracts, tokenSymbol, chainlinkFeedAddress)

  // Assertions about the contract: we are talking to a contract with known bytecode and it's pointed at a known impl
  await assertMTokenProxySetCorrectly(provider, contracts, expectedMarketAddress)
  await assertMTokenProxyByteCodeMatches(provider, expectedMarketAddress)

  // Assert no supply speeds, and a very slow borrow speed.
  const expectedBorrowSpeed = new BigNumber(1)
  const expectedSupplySpeed = new BigNumber(0)
  await assertMarketNativeTokenRewardSpeed(
    contracts,
    provider,
    expectedMarketAddress,
    expectedSupplySpeed,
    expectedBorrowSpeed
  )
  await assertMarketGovTokenRewardSpeed(
    contracts,
    provider,
    expectedMarketAddress,
    expectedSupplySpeed,
    expectedBorrowSpeed
  )

  console.log()
}

export async function assertExpectedEndState(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  tokenAddresses: Array<string>,
  chainlinkFeedAddresses: Array<string>,
  tokenSymbols: Array<string>,
  mTokenNames: Array<string>,
  mTokenSymbols: Array<string>,
  reserveFactoryPercents: Array<number>,
  protocolSeizeSharePercents: Array<number>,
  collateralFactorPercents: Array<number>,
  borrowCaps: Array<number>,
  tokenDecimals: Array<number>,
  expectedMarketAddresses: Array<string>
) {
  for (let i = 0; i < tokenAddresses.length; i++) {
    await assertExpectedStateEndStateForToken(
      provider,
      contracts,
      tokenAddresses[i],
      chainlinkFeedAddresses[i],
      tokenSymbols[i],
      mTokenNames[i],
      mTokenSymbols[i],
      reserveFactoryPercents[i],
      protocolSeizeSharePercents[i],
      collateralFactorPercents[i],
      borrowCaps[i],
      tokenDecimals[i],
      expectedMarketAddresses[i],
    )
  }
}