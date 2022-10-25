import {ethers} from "ethers";
import BigNumber from "bignumber.js";
import {ContractBundle, Market} from "@moonwell-fi/moonwell.js";
import { percentTo18DigitMantissa } from './index'

export async function assertRoundedWellBalance(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, targetAddress: string, name: string, balance: number){
  const wellToken = new ethers.Contract(
    contracts.GOV_TOKEN,
    require('../abi/Well.json').abi,
    provider
  )

  const wellBalance = new BigNumber(
    (await wellToken.balanceOf(targetAddress)).toString()
  )

  const roundedBalance = wellBalance.div(1e18).integerValue()

  if (roundedBalance.isEqualTo(balance)){
    console.log(`    ✅  The ${name} address has ${balance.toLocaleString()} WELL`)
  } else {
    throw new Error(`The ${name} address (${targetAddress}) was expected to have ${balance.toLocaleString()} WELL, found ${parseInt(roundedBalance.toFixed()).toLocaleString()} WELL instead`)
  }

}

export async function assertDexRewarderRewardsPerSec(DEX_REWARDER: string, provider: ethers.providers.JsonRpcProvider, poolID: number, rewardSlot: number, expectedRewardsPerSec: BigNumber){
  console.log("    [-] Checking dex rewarder...")
  const dexRewarder = new ethers.Contract(
    DEX_REWARDER,
    require('../abi/dexRewarder.json').abi,
    provider
  )

  const currentRewardInfo = await dexRewarder.poolRewardInfo(poolID, rewardSlot - 1)
  console.log(`        ✅  Current rewards expire ${new Date(currentRewardInfo.endTimestamp * 1000)}`)
  const newRewardInfo = await dexRewarder.poolRewardInfo(poolID, rewardSlot)
  console.log(`        ✅  Next rewards start ${new Date(newRewardInfo.startTimestamp * 1000)}`)
  console.log(`        ✅  Next rewards end ${new Date(newRewardInfo.endTimestamp * 1000)}`)

  const rewardsPerSec = new BigNumber(newRewardInfo.rewardPerSec.toString())

  if (rewardsPerSec.isEqualTo(expectedRewardsPerSec)){
    console.log(`        ✅  The dex rewarder emissions will be set to ${rewardsPerSec.div(1e18).toFixed(18)} WELL/sec on ${new Date(newRewardInfo.startTimestamp * 1000)}`)
  } else {
    throw new Error(`The Dex Rewarder was expected to have an emission speed of ${expectedRewardsPerSec.div(1e18).toFixed(18)} WELL/sec, found ${rewardsPerSec.div(1e18).toFixed(18)} WELL/sec instead`)
  }
  // poolRewardsPerSec
}

export async function assertSTKWellEmissionsPerSecond(STKWELL: string, provider: ethers.providers.JsonRpcProvider, expectedRewardsPerSec: BigNumber){
  const stkWELL = new ethers.Contract(
    STKWELL,
    require('../abi/StakedWell.json').abi,
    provider
  )

  const currentRewardInfo = await stkWELL.assets(stkWELL.address)

  const rewardsPerSec = new BigNumber(currentRewardInfo.emissionPerSecond.toString())

  if (rewardsPerSec.isEqualTo(expectedRewardsPerSec)){
    console.log(`    ✅  The stkWELL emissions are set to ${rewardsPerSec.div(1e18).toFixed(18)} WELL/sec`)
  } else {
    throw new Error(`The stkWELL emissions were expected to be ${expectedRewardsPerSec.div(1e18).toFixed(18)} WELL/sec, found ${rewardsPerSec.div(1e18).toFixed(18)} WELL/sec instead`)
  }
  // poolRewardsPerSec
}

export async function assertMarketWellRewardSpeed(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, assetName: string, expectedSupplySpeed: BigNumber, expectedBorrowSpeed: BigNumber){
  const unitroller = new ethers.Contract(
    contracts.COMPTROLLER,
    require('../abi/Comptroller.json').abi,
    provider
  )

  // 0 = WELL, 1 = GLMR
  const supplyRewardSpeed = new BigNumber((await unitroller.supplyRewardSpeeds(0, contracts.MARKETS[assetName].mTokenAddress)).toString())

  if (supplyRewardSpeed.isEqualTo(expectedSupplySpeed)){
    console.log(`    ✅  The supply speed on the ${assetName} market is set to ${supplyRewardSpeed.div(1e18).toFixed(18)} WELL/sec`)
  } else {
    throw new Error(`The supply speed for ${assetName} was expected to be ${expectedSupplySpeed.div(1e18).toFixed(18)} WELL/sec, found ${supplyRewardSpeed.div(1e18).toFixed(18)} WELL/sec instead`)
  }

  const borrowRewardSpeed = new BigNumber((await unitroller.borrowRewardSpeeds(0, contracts.MARKETS[assetName].mTokenAddress)).toString())

  if (borrowRewardSpeed.isEqualTo(expectedBorrowSpeed)){
    console.log(`    ✅  The borrow speed on the ${assetName} market is set to ${borrowRewardSpeed.div(1e18).toFixed(18)} WELL/sec`)
  } else {
    throw new Error(`The borrow speed for ${assetName} was expected to be ${expectedBorrowSpeed.div(1e18).toFixed(18)} WELL/sec, found ${borrowRewardSpeed.div(1e18).toFixed(18)} WELL/sec instead`)
  }
}

export async function assertMarketBorrowIsPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const result = await unitroller.borrowGuardianPaused(market.mTokenAddress)

  if (result === false){
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market borrow is paused`)
  }
}
export async function assertMarketBorrowIsNOTPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const result = await unitroller.borrowGuardianPaused(market.mTokenAddress)

  if (result === true){
    throw new Error(`The ${market.name} market was expected to NOT be paused but was!`)
  } else {
    console.log(`    ✅ ${market.name} market borrow IS NOT paused`)
  }
}

export async function assertMarketSupplyingIsPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const result = await unitroller.mintGuardianPaused(market.mTokenAddress)

  if (result === false){
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market supply is paused`)
  }
}
export async function assertMarketSupplyingIsNOTPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const result = await unitroller.mintGuardianPaused(market.mTokenAddress)

  if (result === true){
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market supply IS NOT paused`)
  }
}

export async function assertMarketCFIsNonZero(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const marketData = await unitroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (marketData.collateralFactorMantissa.isZero()){
    throw new Error(`The ${market.name} market has CF=${mantissaFormatted.times(100)}%, which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}
export async function assertMarketCFIsZero(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const marketData = await unitroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (!marketData.collateralFactorMantissa.isZero()){
    throw new Error(`The ${market.name} market has that is NONZERO (${mantissaFormatted.times(100)}%), which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}

export async function assertMarketRFIsNOTOneHundred(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const mToken = new ethers.Contract(
      market.mTokenAddress,
      require('../abi/MToken.json').abi,
      provider
  )

  const reserveFactor = await mToken.reserveFactorMantissa()

  const reserveFactorFormatted = new BigNumber(reserveFactor.toString()).div(1e18)

  if (reserveFactorFormatted.eq(1)){
    throw new Error(`The ${market.name} market has RF=${reserveFactorFormatted.times(100).toFixed()}%, which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Reserve Factor is currently set to ${reserveFactorFormatted.times(100).toFixed()}%`)
  }
}

export async function assertMarketRFIsOneHundred(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const mToken = new ethers.Contract(
      market.mTokenAddress,
      require('../abi/MToken.json').abi,
      provider
  )

  const reserveFactor = await mToken.reserveFactorMantissa()

  const reserveFactorFormatted = new BigNumber(reserveFactor.toString()).div(1e18)

  if (!reserveFactorFormatted.eq(1)){
    throw new Error(`The ${market.name} market has RF=${reserveFactorFormatted.times(100).toFixed()}%, which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Reserve Factor is currently set to ${reserveFactorFormatted.times(100).toFixed()}%`)
  }
}

export async function assertTransferGuardianPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const transferGuardianPaused = await unitroller.transferGuardianPaused()

  if (transferGuardianPaused === false){
    throw new Error(`Transfers are NOT paused, and expected to be paused`)
  } else {
    console.log(`    ✅ Comptroller transfer guardian IS currently paused/engaged`)
  }
}

export async function assertTransferGuardianIsNotPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle){
  const unitroller = new ethers.Contract(
      contracts.COMPTROLLER,
      require('../abi/Comptroller.json').abi,
      provider
  )

  const transferGuardianPaused = await unitroller.transferGuardianPaused()

  if (transferGuardianPaused === true){
    throw new Error(`Transfers ARE paused, and expected to NOT be paused`)
  } else {
    console.log(`    ✅ Comptroller transfer guardian is NOT currently paused/engaged`)
  }
}

/**
 * Assert a market is not listed by querying the comptroller. 
 * 
 * NOTE: This function will fail if given the native asset.
 * TODO(lunar-eng): Fix the above note. 
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetUnderlyingTokenAddress The address of an ERC-20 token to ensure is not listed. 
 */
export async function assertMarketIsNotListed(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, targetUnderlyingTokenAddress: string){
  const unitroller = new ethers.Contract(
    contracts.COMPTROLLER,
    require('../abi/Comptroller.json').abi,
    provider
  )

  // Note that we fetch contracts from the unitroller, rather than using the static list in moonwell.js. This avoids the case
  // where a future version of moonwell.js includes a new market which would break this assertion.
  const allMarkets = await unitroller.getAllMarkets()

  const marketContracts = allMarkets.map((market: string) => {
    return new ethers.Contract(
      market,
      require('../abi/MErc20Delegator.json').abi,
      provider
    )
  })

  for (const marketContract of marketContracts) {
    // Underlying will fail for the native asset.
    let tokenAddress
    try {
      tokenAddress = await marketContract.underlying()
    } catch (e: unknown) {
      continue
    }

    if (addressesMatch(tokenAddress, targetUnderlyingTokenAddress)) {
      throw new Error(`Market ${targetUnderlyingTokenAddress} is listed!`)
    }
  }
  console.log(`    ✅ Market is not listed`)
}

/**
 * Assert a market is listed by querying the comptroller. 
 * 
 * NOTE: This function will fail if given the native asset.
 * TODO(lunar-eng): Fix the above note. 
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param targetUnderlyingTokenAddress The address of an ERC-20 token to ensure is not listed. 
 * @param expectedAddress The expected address.
 */
 export async function assertMarketIsListed(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, targetUnderlyingTokenAddress: string, expectedAddress: string){
  const unitroller = new ethers.Contract(
    contracts.COMPTROLLER,
    require('../abi/Comptroller.json').abi,
    provider
  )

  // Note that we fetch contracts from the unitroller, rather than using the static list in moonwell.js. This avoids the case
  // where a future version of moonwell.js includes a new market which would break this assertion.
  const allMarkets = await unitroller.getAllMarkets()

  const marketContracts = allMarkets.map((market: string) => {
    return new ethers.Contract(
      market,
      require('../abi/MErc20Delegator.json').abi,
      provider
    )
  })

  for (const marketContract of marketContracts) {
    // Underlying will fail for the native asset.
    let tokenAddress
    try {
      tokenAddress = await marketContract.underlying()
    } catch (e: unknown) {
      continue
    }
    if (addressesMatch(tokenAddress, targetUnderlyingTokenAddress)) {
      if (!addressesMatch(marketContract.address, expectedAddress)) {
        throw new Error(`Market ${targetUnderlyingTokenAddress} is listed, but not at the right address. Actual: ${marketContract.address} Expected: ${expectedAddress}`)
      }
      
      console.log(`    ✅ Market is listed`)
      return
    }
  }
  throw new Error(`Market ${targetUnderlyingTokenAddress} is not listed!`)
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
  const oracle = new ethers.Contract(
    contracts.ORACLE,
    require('../abi/ChainlinkOracle.json').abi,
    provider
  )

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
  const oracle = new ethers.Contract(
    contracts.ORACLE,
    require('../abi/ChainlinkOracle.json').abi,
    provider
  )

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
  const market = new ethers.Contract(
    marketAddress,
    require('../abi/MToken.json').abi,
    provider
  )

  await assertStorageAddress(market, contracts.TIMELOCK, 'admin')
}

export async function assertCF(
  provider: ethers.providers.JsonRpcProvider, 
  contracts: ContractBundle,
  marketAddress: string,
  expectedCollateralFactor: number
) {
  const comptroller = new ethers.Contract(
    contracts.COMPTROLLER,
    require('../abi/Comptroller.json').abi,
    provider
  )

  const marketData = await comptroller.markets(marketAddress)
  console.log(marketData)
  const collateralFactor = marketData.collateralFactorMantissa
  console.log(collateralFactor)
  const expected = percentTo18DigitMantissa(expectedCollateralFactor)
  if (!collateralFactor.eq(expected)) {
    throw new Error(`Unexpected Collateral Factor value in market ${marketAddress}. Expected: ${expected}, Actual: ${collateralFactor.toString()}`)
  }
  console.log(`    ✅ Collateral Factor share set correctly.`)
}

export async function assertMarketRF(
  provider: ethers.providers.JsonRpcProvider, 
  marketAddress: string,
  expectedRFPercent: number
) {
  const market = new ethers.Contract(
    marketAddress,
    require('../abi/MToken.json').abi,
    provider
  )

  const reserveFactor = await market.reserveFactorMantissa()
  const expected = percentTo18DigitMantissa(expectedRFPercent)
  if (!reserveFactor.eq(expected)) {
    throw new Error(`Unexpected RF value in market ${marketAddress}. Expected: ${expected}, Actual: ${reserveFactor.toString()}`)
  }
  console.log(`    ✅ Reserve Factor set correctly.`)
}

export async function assertMarketSeizeShare(
  provider: ethers.providers.JsonRpcProvider, 
  marketAddress: string,
  expectedSeizeSharePercent: number
) {
  const market = new ethers.Contract(
    marketAddress,
    require('../abi/MToken.json').abi,
    provider
  )

  const seizeShare = await market.protocolSeizeShareMantissa()
  const expected = percentTo18DigitMantissa(expectedSeizeSharePercent)
  if (!seizeShare.eq(expected)) {
    throw new Error(`Unexpected Seize Share value value in market ${marketAddress}. Expected: ${expected}, Actual: ${seizeShare.toString()}`)
  }
  console.log(`    ✅ Protocol Seize share set correctly.`)
}

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

function addressesMatch(a: string, b: string) {
  if (!a.startsWith('0x') || !b.startsWith('0x')) {
    throw new Error(`Invalid addresss comparison, both must start with '0x'! Inputs: ${a}, ${b}`)
  }
  return a.toUpperCase() === b.toUpperCase()
}