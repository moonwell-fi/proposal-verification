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
  assertMarketGovTokenRewardSpeedWithAddress,
  assertMarketNativeTokenRewardSpeedWithAddress
} from "../../src/verification/assertions";
import {ContractBundle, getContract} from "@moonwell-fi/moonwell.js";
import BigNumber from "bignumber.js";

export async function assertExpectedEndState(
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
  expectedMarketAddress: string
){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

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
    
    // Assert a chain link feed is registered
    await assertChainlinkFeedIsRegistered(provider, contracts, tokenSymbol, chainlinkFeedAddress)

    // Assertions about the contract: we are talking to a contract with known bytecode and it's pointed at a known impl
    await assertMTokenProxySetCorrectly(provider, contracts, expectedMarketAddress)
    await assertMTokenProxyByteCodeMatches(provider, expectedMarketAddress)

    // Assert no supply speeds, and a very slow borrow speed.
    const expectedBorrowSpeed = new BigNumber(1)
    const expectedSupplySpeed = new BigNumber(0)
    await assertMarketGovTokenRewardSpeedWithAddress(contracts, provider, expectedMarketAddress, expectedSupplySpeed, expectedBorrowSpeed)
    await assertMarketNativeTokenRewardSpeedWithAddress(contracts, provider, expectedMarketAddress, expectedSupplySpeed, expectedBorrowSpeed)
}