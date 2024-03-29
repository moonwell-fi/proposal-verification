import { ethers, BigNumber as EthersBigNumber } from "ethers";
import BigNumber from "bignumber.js";
import { ContractBundle, getContract, getDeployArtifact, Market } from "@moonwell-fi/moonwell.js";
import { govTokenTicker, nativeTicker, percentTo18DigitMantissa } from "./index";

export async function assertRoundedWellBalance(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, targetAddress: string, name: string, balance: number) {
  const wellToken = contracts.GOV_TOKEN.contract.connect(provider)

  const wellBalance = new BigNumber(
    (await wellToken.balanceOf(targetAddress)).toString()
  )

  const roundedBalance = wellBalance.div(1e18).integerValue()

  if (roundedBalance.isEqualTo(balance)) {
    console.log(`    ✅  The ${name} address has ${balance.toLocaleString()} ${govTokenTicker(contracts)}`)
  } else {
    throw new Error(`The ${name} address (${targetAddress}) was expected to have ${balance.toLocaleString()} ${govTokenTicker(contracts)}, found ${parseInt(roundedBalance.toFixed()).toLocaleString()} ${govTokenTicker(contracts)} instead`)
  }

}

export async function assertDexRewarderRewardsPerSec(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, poolID: number, rewardSlot: number, expectedRewardsPerSec: BigNumber, ticker = "(WELL OR MFAM)") {
  console.log("    [-] Checking dex rewarder...")
  const dexRewarder = contracts.DEX_REWARDER.contract.connect(provider)

  const currentRewardInfo = await dexRewarder.poolRewardInfo(poolID, rewardSlot - 1)
  console.log(`        ✅  Current rewards expire ${new Date(currentRewardInfo.endTimestamp * 1000)}`)
  const newRewardInfo = await dexRewarder.poolRewardInfo(poolID, rewardSlot)
  console.log(`        ✅  Next rewards start ${new Date(newRewardInfo.startTimestamp * 1000)}`)
  console.log(`        ✅  Next rewards end ${new Date(newRewardInfo.endTimestamp * 1000)}`)

  const rewardsPerSec = new BigNumber(newRewardInfo.rewardPerSec.toString())

  if (rewardsPerSec.isEqualTo(expectedRewardsPerSec)) {
    console.log(`        ✅  The dex rewarder emissions will be set to ${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec on ${new Date(newRewardInfo.startTimestamp * 1000)}`)
  } else {
    throw new Error(`The Dex Rewarder was expected to have an emission speed of ${expectedRewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec, found ${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec instead`)
  }
  // poolRewardsPerSec
}

export async function assertSTKWellEmissionsPerSecond(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, expectedRewardsPerSec: BigNumber, ticker = "(WELL or MFAM)") {
  const stkWELL = contracts.SAFETY_MODULE.contract.connect(provider)

  const currentRewardInfo = await stkWELL.assets(stkWELL.address)

  const rewardsPerSec = new BigNumber(currentRewardInfo.emissionPerSecond.toString())

  if (rewardsPerSec.isEqualTo(expectedRewardsPerSec)) {
    console.log([
        `    ✅  The stkWELL emissions are set to:`,
        `${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec`,
        `${parseFloat(rewardsPerSec.div(1e18).times(86400).toFixed(4)).toLocaleString()} ${ticker}/day`,
        `${parseFloat(rewardsPerSec.div(1e18).times(86400).times(30).toFixed(4)).toLocaleString()} ${ticker}/month`,
    ].join('\n        |- '))
  } else {
    throw new Error(`The stkWELL emissions were expected to be ${expectedRewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec, found ${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec instead`)
  }
  // poolRewardsPerSec
}

export async function assertMarketGovTokenRewardSpeed(
  contracts: ContractBundle,
  provider: ethers.providers.JsonRpcProvider,
  assetName: string,
  expectedSupplySpeed: BigNumber,
  expectedBorrowSpeed: BigNumber,
  extraMarketAddresses: any = {}
) {
  const unitroller = contracts.COMPTROLLER.contract.connect(provider)
  const mTokenAddress = contracts.MARKETS[assetName]?.mTokenAddress ?? extraMarketAddresses[assetName]

  // 0 = WELL, 1 = GLMR
  const supplyRewardSpeed = new BigNumber((await unitroller.supplyRewardSpeeds(0, mTokenAddress)).toString())

  if (supplyRewardSpeed.isEqualTo(expectedSupplySpeed)) {
    console.log([
      `    ✅  ${assetName} ${govTokenTicker(contracts)} SUPPLY speed:`,
        `${supplyRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec`,
        `${parseFloat(supplyRewardSpeed.div(1e18).times(86400).toFixed(4)).toLocaleString()} ${govTokenTicker(contracts)}/day`,
        `${parseFloat(supplyRewardSpeed.div(1e18).times(86400).times(30).toFixed(4)).toLocaleString()} ${govTokenTicker(contracts)}/month`,
    ].join('\n        |- '))
  } else {
    throw new Error(`The supply speed for ${assetName} was expected to be ${expectedSupplySpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec, found ${supplyRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec instead`)
  }

  const borrowRewardSpeed = new BigNumber((await unitroller.borrowRewardSpeeds(0, mTokenAddress)).toString())

  if (borrowRewardSpeed.isEqualTo(expectedBorrowSpeed)) {
    console.log([
        `    ✅  ${assetName} ${govTokenTicker(contracts)} BORROW speed:`,
        `${borrowRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec`,
        `${parseFloat(borrowRewardSpeed.div(1e18).times(86400).toFixed(4)).toLocaleString()} ${govTokenTicker(contracts)}/day`,
        `${parseFloat(borrowRewardSpeed.div(1e18).times(86400).times(30).toFixed(4)).toLocaleString()} ${govTokenTicker(contracts)}/month`,
    ].join('\n        |- '))
  } else {
    throw new Error(`The borrow speed for ${assetName} was expected to be ${expectedBorrowSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec, found ${borrowRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec instead`)
  }
}

export async function assertMarketNativeTokenRewardSpeed(
  contracts: ContractBundle,
  provider: ethers.providers.JsonRpcProvider,
  assetName: string,
  expectedSupplySpeed: BigNumber,
  expectedBorrowSpeed: BigNumber,
  extraMarketAddresses: any = {}
) {
  const unitroller = contracts.COMPTROLLER.contract.connect(provider)
  const mTokenAddress = contracts.MARKETS[assetName]?.mTokenAddress ?? extraMarketAddresses[assetName]

  // 0 = WELL/MFAM, 1 = GLMR/MOVR
  const supplyRewardSpeed = new BigNumber((await unitroller.supplyRewardSpeeds(1, mTokenAddress)).toString())

  if (supplyRewardSpeed.isEqualTo(expectedSupplySpeed)) {
    console.log([
      `    ✅  ${assetName} ${nativeTicker(contracts)} SUPPLY speed:`,
      `${supplyRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec`,
      `${parseFloat(supplyRewardSpeed.div(1e18).times(86400).toFixed(4)).toLocaleString()} ${nativeTicker(contracts)}/day`,
      `${parseFloat(supplyRewardSpeed.div(1e18).times(86400).times(30).toFixed(4)).toLocaleString()} ${nativeTicker(contracts)}/month`,
    ].join('\n        |- '))
  } else {
    throw new Error(`The supply speed for ${assetName} was expected to be ${expectedSupplySpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec, found ${supplyRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec instead`)
  }

  const borrowRewardSpeed = new BigNumber((await unitroller.borrowRewardSpeeds(1, mTokenAddress)).toString())

  if (borrowRewardSpeed.isEqualTo(expectedBorrowSpeed)) {
    console.log([
      `    ✅  ${assetName} ${nativeTicker(contracts)} BORROW speed:`,
      `${borrowRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec`,
      `${parseFloat(borrowRewardSpeed.div(1e18).times(86400).toFixed(4)).toLocaleString()} ${nativeTicker(contracts)}/day`,
      `${parseFloat(borrowRewardSpeed.div(1e18).times(86400).times(30).toFixed(4)).toLocaleString()} ${nativeTicker(contracts)}/month`,
    ].join('\n        |- '))
  } else {
    throw new Error(`The borrow speed for ${assetName} was expected to be ${expectedBorrowSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec, found ${borrowRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec instead`)
  }
}

export async function assertMarketBorrowIsPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const result = await comptroller.borrowGuardianPaused(market.mTokenAddress)

  if (result === false) {
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market borrow is paused`)
  }
}

export async function assertMarketBorrowIsNOTPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const result = await comptroller.borrowGuardianPaused(market.mTokenAddress)

  if (result === true) {
    throw new Error(`The ${market.name} market was expected to NOT be paused but was!`)
  } else {
    console.log(`    ✅ ${market.name} market borrow IS NOT paused`)
  }
}

export async function assertMarketSupplyingIsPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const result = await comptroller.mintGuardianPaused(market.mTokenAddress)

  if (result === false) {
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market supply is paused`)
  }
}
export async function assertMarketSupplyingIsNOTPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const result = await comptroller.mintGuardianPaused(market.mTokenAddress)

  if (result === true) {
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market supply IS NOT paused`)
  }
}

export async function assertMarketCFIsNonZero(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const marketData = await comptroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (marketData.collateralFactorMantissa.isZero()) {
    throw new Error(`The ${market.name} market has CF=${mantissaFormatted.times(100)}%, which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}
export async function assertMarketCFIsZero(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const marketData = await comptroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (!marketData.collateralFactorMantissa.isZero()) {
    throw new Error(`The ${market.name} market has that is NONZERO (${mantissaFormatted.times(100)}%), which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}

export async function assertMarketCFEqualsPercent(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market, expectedPercent: number) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const marketData = await comptroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (!mantissaFormatted.times(100).isEqualTo(expectedPercent)) {
    throw new Error(`The ${market.name} market has that DOES NOT EQUAL (${expectedPercent}%), which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}

export async function assertMarketRFIsNOTOneHundred(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const mToken = new ethers.Contract(
    market.mTokenAddress,
    getDeployArtifact('MToken').abi,
    provider
  )

  const reserveFactor = await mToken.reserveFactorMantissa()

  const reserveFactorFormatted = new BigNumber(reserveFactor.toString()).div(1e18)

  if (reserveFactorFormatted.eq(1)) {
    throw new Error(`The ${market.name} market has RF=${reserveFactorFormatted.times(100).toFixed()}%, which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Reserve Factor is currently set to ${reserveFactorFormatted.times(100).toFixed()}%`)
  }
}

export async function assertMarketRFIsOneHundred(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market) {
  const mToken = new ethers.Contract(
    market.mTokenAddress,
    getDeployArtifact('MToken').abi,
    provider
  )

  const reserveFactor = await mToken.reserveFactorMantissa()

  const reserveFactorFormatted = new BigNumber(reserveFactor.toString()).div(1e18)

  if (!reserveFactorFormatted.eq(1)) {
    throw new Error(`The ${market.name} market has RF=${reserveFactorFormatted.times(100).toFixed()}%, which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Reserve Factor is currently set to ${reserveFactorFormatted.times(100).toFixed()}%`)
  }
}

export async function assertTransferGuardianPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const transferGuardianPaused = await comptroller.transferGuardianPaused()

  if (transferGuardianPaused === false) {
    throw new Error(`Transfers are NOT paused, and expected to be paused`)
  } else {
    console.log(`    ✅ Comptroller transfer guardian IS currently paused/engaged`)
  }
}

export async function assertTransferGuardianIsNotPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const transferGuardianPaused = await comptroller.transferGuardianPaused()

  if (transferGuardianPaused === true) {
    throw new Error(`Transfers ARE paused, and expected to NOT be paused`)
  } else {
    console.log(`    ✅ Comptroller transfer guardian is NOT currently paused/engaged`)
  }
}

/**
 * Assert a token market is NOT listed. 
 * 
 * Use `assertNativeMarketIsNotListed` for the native asset.
 * TODO(lunar-eng): Implement this function when needed.
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetUnderlyingTokenAddress The address of an ERC-20 token to ensure is not listed. 
 */
export async function assertTokenMarketIsNotListed(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  targetUnderlyingTokenAddress: string
) {
  assertMarketIsNotListed(provider, contracts, targetUnderlyingTokenAddress)
}

/**
 * Assert a token market is listed. 
 * 
 * Use `assertNativeMarketIsListed` for the native asset.
 * TODO(lunar-eng): Implement this function when needed.
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetUnderlyingTokenAddress The address of an ERC-20 token to ensure is not listed. 
 */
export async function assertTokenMarketIsListed(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  targetUnderlyingTokenAddress: string
) {
  assertTokenMarketIsListed(provider, contracts, targetUnderlyingTokenAddress)
}

/**
 * Assert a market is NOT listed by querying the comptroller. 
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetUnderlyingTokenAddress The address of an ERC-20 token to ensure is not listed.  Pass null for the native asset.
 */
async function assertMarketIsNotListed(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  targetUnderlyingTokenAddress: string | null
) {
  const isListed = await isMarketListed(provider, contracts, targetUnderlyingTokenAddress)
  if (isListed) {
    throw new Error(`${targetUnderlyingTokenAddress ? `Token ${targetUnderlyingTokenAddress}` : 'The Native asset'} IS listed.`)
  }
  console.log(`    ✅ Market is NOT listed`)
}

/**
 * Assert a market is listed by querying the comptroller. 
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetUnderlyingTokenAddress The address of an ERC-20 token to ensure is not listed.  Pass null for the native asset.
 */
async function assertMarketIsListed(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  targetUnderlyingTokenAddress: string,
  expectedAddress: string
) {
  const isListed = await isMarketListed(provider, contracts, targetUnderlyingTokenAddress)
  if (!isListed) {
    console.log(`    ✅ Market is listed`)
  }
  throw new Error(`${targetUnderlyingTokenAddress ? `Token ${targetUnderlyingTokenAddress}` : 'The Native asset'} IS listed.`)
}

/**
 * Returns whether a market is listed by querying the comptroller. 
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetUnderlyingTokenAddress The address of an ERC-20 token to check.  Pass null for the native asset.
 */
async function isMarketListed(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  targetUnderlyingTokenAddress: string | null
) {
  // Determine native asset market - this is a special case.
  const nativeAssetMTokenAddress = contracts.MARKETS[nativeTicker(contracts)].mTokenAddress

  // List all markets
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)
  const listedMTokenAddresses: Array<string> = await comptroller.getAllMarkets()
  for (const listedMTokenAddress of listedMTokenAddresses) {
    // Check for native market special case because there is no 'underlying()' function on the market.
    if (addressesMatch(nativeAssetMTokenAddress, listedMTokenAddress)) {
      // If the native market is what is being checked for, 
      // Otherwise just contineu
      if (targetUnderlyingTokenAddress === null) {
        return true
      } else {
        continue
      }
    }

    // Otherwise load the market and compare the underlying addresses.
    const market = getContract('MErc20Delegator', listedMTokenAddress, provider)
    const underlyingTokenAddress = await market.underlying()
    if (addressesMatch(targetUnderlyingTokenAddress, underlyingTokenAddress)) {
      return true
    }
  }

  // Market is not listed.
  return false
}

/**
 * Assert a chainlink feed is not registered for a token with the given symbol. 
 * 
 * NOTE: This function will fail if given the native asset.
 * TODO(lunar-eng): Fix the above note. 
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetSymbol The symbol of an asset to query.
 */
export async function assertChainlinkFeedIsNotRegistered(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, targetSymbol: string) {
  const oracle = contracts.ORACLE.contract.connect(provider)

  const feed = await oracle.getFeed(targetSymbol)
  if (feed !== ethers.constants.AddressZero) {
    throw new Error(`There is a feed registered for symbol ${targetSymbol}`)
  }
  console.log(`    ✅ No Chainlink Feed registered`)
}

/**
 * Assert a chainlink feed is registered for a token with the given symbol.
 * 
 * NOTE: This function will fail if given the native asset.
 * TODO(lunar-eng): Fix the above note. 
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetSymbol The symbol of an asset to query.
 * @param expectedAddress The expected feed. 
 */
export async function assertChainlinkFeedIsRegistered(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, targetSymbol: string, expectedAddress: string) {
  const oracle = contracts.ORACLE.contract.connect(provider)

  const feed = await oracle.getFeed(targetSymbol)
  if (feed === ethers.constants.AddressZero) {
    throw new Error(`There is a no feed registered for symbol ${targetSymbol}`)
  }

  if (feed !== expectedAddress) {
    throw new Error(`There is a feed registered for ${targetSymbol} but it is not the expected feed. Expected: ${expectedAddress} Actual: ${feed}`)
  }
  console.log(`    ✅ Chainlink Feed registered`)
}

export async function assertTimelockIsAdminOfMarket(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  marketAddress: string
) {
  const market = getContract('MToken', marketAddress, provider)

  await assertStorageAddress(market, contracts.TIMELOCK.address, 'admin')
}

/**
 * Assert the collateral factor of a market is the expected value.
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param marketAddress The address of the market.
 * @param expectedCollateralFactor The expected value.
 */
export async function assertCF(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  marketAddress: string,
  expectedCollateralFactor: number
) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)

  const marketData = await comptroller.markets(marketAddress)
  const collateralFactor = marketData.collateralFactorMantissa
  const expected = percentTo18DigitMantissa(expectedCollateralFactor)
  if (!collateralFactor.eq(expected)) {
    throw new Error(`Unexpected Collateral Factor value in market ${marketAddress}. Expected: ${expected}, Actual: ${collateralFactor.toString()}`)
  }
  console.log(`    ✅ Collateral Factor set to expected value ${expected} / ${expectedCollateralFactor}%.`)
}

/**
 * Assert the borrow cap of a market is the expected value.
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param marketAddress The address of the market.
 * @param borrowCap The expected borrow cap as an integer (ex. 600 = 600 BTC)
 * @param tokenDecimals The number of decimals in the underlying token.
 */
export async function assertBorrowCap(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  marketAddress: string,
  borrowCap: number,
  tokenDecimals: number
) {
  const comptroller = contracts.COMPTROLLER.contract.connect(provider)
  const actual = await comptroller.borrowCaps(marketAddress)
  const expected = EthersBigNumber.from(borrowCap).mul(EthersBigNumber.from("10").pow(tokenDecimals))
  if (!actual.eq(expected)) {
    throw new Error(`Unexpected borrow cap in market ${marketAddress}. Expected: ${expected.toString()}, Actual: ${actual.toString()}`)
  }
  console.log(`    ✅ Borrow Cap set correctly.`)
}


/**
 * Assert the reserve factor of a market is the expected value.
 * 
 * @param provider An ethers provider.
 * @param marketAddress The address of the market.
 * @param expectedRFPercent The expected value as a whole percent (i.e. 25 for 25%)
 */
export async function assertMarketRF(
  provider: ethers.providers.JsonRpcProvider,
  marketAddress: string,
  expectedRFPercent: number
) {
  const market = getContract('MToken', marketAddress, provider)

  const reserveFactor = await market.reserveFactorMantissa()
  const expected = percentTo18DigitMantissa(expectedRFPercent)
  if (!reserveFactor.eq(expected)) {
    throw new Error(`Unexpected RF value in market ${marketAddress}. Expected: ${expected}, Actual: ${reserveFactor.toString()}`)
  }
  console.log(`    ✅ Reserve Factor set to expected value ${expected} / ${expectedRFPercent}%.`)
}

/**
 * Assert the protocol seize share in a market is the expected value.
 * 
 * @param provider An ethers provider.
 * @param marketAddress The address of the market.
 * @param expectedSeizeSharePercent The expected value.
 */
export async function assertMarketSeizeShare(
  provider: ethers.providers.JsonRpcProvider,
  marketAddress: string,
  expectedSeizeSharePercent: number
) {
  const market = getContract('MToken', marketAddress, provider)

  const seizeShare = await market.protocolSeizeShareMantissa()
  const expected = percentTo18DigitMantissa(expectedSeizeSharePercent)
  if (!seizeShare.eq(expected)) {
    throw new Error(`Unexpected Seize Share value value in market ${marketAddress}. Expected: ${expected}, Actual: ${seizeShare.toString()}`)
  }
  console.log(`    ✅ Protocol Seize share set correctly.`)
}

/**
 * Assert an mToken proxy is pointing at the mToken implementation contract.
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param marketProxyAddress The market to inspect.
 */
export async function assertMTokenProxySetCorrectly(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  marketProxyAddress: string
) {
  const mTokenProxy = getContract('MErc20Delegator', marketProxyAddress, provider)
  await assertStorageAddress(mTokenProxy, contracts.MERC_20_IMPL.address, 'implementation')
}

/**
 * Assert the given contract has the bytecode of the MErc20Delegator.
 * 
 * @param provider An ethers provider.
 * @param marketProxyAddress The market to inspect.
 */
export async function assertMTokenProxyByteCodeMatches(
  provider: ethers.providers.JsonRpcProvider,
  marketProxyAddress: string
) {
  const byteCode = await provider.getCode(marketProxyAddress)
  const expectedBytecode = getDeployArtifact('MErc20Delegator').bytecode

  if (byteCode === expectedBytecode) {
    throw new Error(`Unexpected byte code in contract ${marketProxyAddress}`)
  }
  console.log(`    ✅ Contract byte code matches expectations.`)
}

/**
 * Assert a string in storage is the expected string
 * 
 * @param contract A contract instance to introspect
 * @param expected The expected value
 * @param methodName The view method name to call on the contract to get the actual value.
 */
export async function assertStorageString(
  contract: any,
  expected: string,
  methodName: string
) {
  const value: string = await contract[methodName]()
  if (value !== expected) {
    throw new Error(`Unexpected storage value in ${contract.address}.${methodName}. Expected: ${expected}, Actual: ${value}`)
  }
  console.log(`    ✅ ${methodName} set correctly.`)
}

/**
 * Assert an address in storage is the expected address
 * 
 * @param contract A contract instance to introspect
 * @param expected The expected value
 * @param methodName The view method name to call on the contract to get the actual value.
 */
export async function assertStorageAddress(
  contract: any,
  expected: string,
  methodName: string
) {
  const value: string = await contract[methodName]()
  if (!addressesMatch(expected, value)) {
    throw new Error(`Unexpected address at ${contract.address}.${methodName}. Expected: ${expected}, Actual: ${value}`)
  }
  console.log(`    ✅ ${methodName} address set correctly.`)
}

/**
 * Assert two addresses match.
 * 
 * @param a The first address.
 * @param b The second address.
 * @returns A boolean indicating whether they match.
 */
function addressesMatch(a: string, b: string) {
  if (!a.startsWith('0x') || !b.startsWith('0x')) {
    throw new Error(`Invalid addresss comparison, both must start with '0x'! Inputs: ${a}, ${b}`)
  }
  return a.toUpperCase() === b.toUpperCase()
}