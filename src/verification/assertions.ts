import {ethers} from "ethers";
import BigNumber from "bignumber.js";
import {ContractBundle, getContract, getDeployArtifact, getNativeTokenSymbol, Market} from "@moonwell-fi/moonwell.js";
import {govTokenTicker, nativeTicker, percentTo18DigitMantissa} from "./index";

export async function assertRoundedWellBalance(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, targetAddress: string, name: string, balance: number){
  const wellToken = contracts.GOV_TOKEN.getContract(provider)

  const wellBalance = new BigNumber(
    (await wellToken.balanceOf(targetAddress)).toString()
  )

  const roundedBalance = wellBalance.div(1e18).integerValue()

  if (roundedBalance.isEqualTo(balance)){
    console.log(`    ✅  The ${name} address has ${balance.toLocaleString()} ${govTokenTicker(contracts)}`)
  } else {
    throw new Error(`The ${name} address (${targetAddress}) was expected to have ${balance.toLocaleString()} ${govTokenTicker(contracts)}, found ${parseInt(roundedBalance.toFixed()).toLocaleString()} ${govTokenTicker(contracts)} instead`)
  }

}

export async function assertDexRewarderRewardsPerSec(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, poolID: number, rewardSlot: number, expectedRewardsPerSec: BigNumber, ticker = "(WELL OR MFAM)"){
  console.log("    [-] Checking dex rewarder...")
  const dexRewarder = contracts.DEX_REWARDER.getContract(provider)

  const currentRewardInfo = await dexRewarder.poolRewardInfo(poolID, rewardSlot - 1)
  console.log(`        ✅  Current rewards expire ${new Date(currentRewardInfo.endTimestamp * 1000)}`)
  const newRewardInfo = await dexRewarder.poolRewardInfo(poolID, rewardSlot)
  console.log(`        ✅  Next rewards start ${new Date(newRewardInfo.startTimestamp * 1000)}`)
  console.log(`        ✅  Next rewards end ${new Date(newRewardInfo.endTimestamp * 1000)}`)

  const rewardsPerSec = new BigNumber(newRewardInfo.rewardPerSec.toString())

  if (rewardsPerSec.isEqualTo(expectedRewardsPerSec)){
    console.log(`        ✅  The dex rewarder emissions will be set to ${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec on ${new Date(newRewardInfo.startTimestamp * 1000)}`)
  } else {
    throw new Error(`The Dex Rewarder was expected to have an emission speed of ${expectedRewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec, found ${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec instead`)
  }
  // poolRewardsPerSec
}

export async function assertSTKWellEmissionsPerSecond(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, expectedRewardsPerSec: BigNumber, ticker = "(WELL or MFAM)"){
  const stkWELL = contracts.SAFETY_MODULE.getContract(provider)

  const currentRewardInfo = await stkWELL.assets(stkWELL.address)

  const rewardsPerSec = new BigNumber(currentRewardInfo.emissionPerSecond.toString())

  if (rewardsPerSec.isEqualTo(expectedRewardsPerSec)){
    console.log(`    ✅  The stkWELL emissions are set to ${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec`)
  } else {
    throw new Error(`The stkWELL emissions were expected to be ${expectedRewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec, found ${rewardsPerSec.div(1e18).toFixed(18)} ${ticker}/sec instead`)
  }
  // poolRewardsPerSec
}

export async function assertMarketGovTokenRewardSpeed(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, assetName: string, expectedSupplySpeed: BigNumber, expectedBorrowSpeed: BigNumber){
  const unitroller = contracts.COMPTROLLER.getContract(provider)

  // const mTokenAddress = await getmTokenContractAddress(contracts, provider, assetName)

  // 0 = WELL, 1 = GLMR
  const supplyRewardSpeed = new BigNumber((await unitroller.supplyRewardSpeeds(0, contracts.MARKETS[assetName].mTokenAddress)).toString())

  if (supplyRewardSpeed.isEqualTo(expectedSupplySpeed)){
    console.log(`    ✅  The SUPPLY speed on the ${assetName} market is set to ${supplyRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec`)
  } else {
    throw new Error(`The supply speed for ${assetName} was expected to be ${expectedSupplySpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec, found ${supplyRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec instead`)
  }

  const borrowRewardSpeed = new BigNumber((await unitroller.borrowRewardSpeeds(0, contracts.MARKETS[assetName].mTokenAddress)).toString())

  if (borrowRewardSpeed.isEqualTo(expectedBorrowSpeed)){
    console.log(`    ✅  The BORROW speed on the ${assetName} market is set to ${borrowRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec`)
  } else {
    throw new Error(`The borrow speed for ${assetName} was expected to be ${expectedBorrowSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec, found ${borrowRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec instead`)
  }
}

// const getmTokenContractAddress = async (
//   contracts: ContractBundle, 
//   provider: ethers.providers.JsonRpcProvider, 
//   underlyingSymbol: string
// ): Promise<string> => {
//   // We cannot call 'underlying' on the native token, so special case it.
//   if (underlyingSymbol === nativeTicker(contracts)) {
//     return contracts.MARKETS[underlyingSymbol].mTokenAddress
//   }

//   const unitroller = contracts.COMPTROLLER.getContract(provider)

//   // Note that we fetch contracts from the unitroller, rather than using the static list in moonwell.js. This avoids the case
//   // where a future version of moonwell.js includes a new market which would break this assertion.
//   const allMarkets = await unitroller.getAllMarkets()
//   const marketContracts = allMarkets.map((market: string) => {
//     return getContract('MErc20Delegator', market, provider)
//   })

//   for (const marketContract of marketContracts) {
//     // Underlying will fail for the native asset.
//     let tokenAddress
//     try {
//       tokenAddress = await marketContract.underlying()
//     } catch (e: unknown) {
//       continue
//     }
//     const underlyingToken = getContract('MErc20Delegator', tokenAddress, provider)

//     if (await underlyingToken.symbol() === underlyingSymbol) {
//       return tokenAddress
//     }
//   }
//   throw new Error(`Could not locate underlying token with symbol ${underlyingSymbol}`)
// }
    
export async function assertMarketNativeTokenRewardSpeed(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, assetName: string, expectedSupplySpeed: BigNumber, expectedBorrowSpeed: BigNumber){
  const comptroller = contracts.COMPTROLLER.getContract(provider)
  // const mTokenAddress = await getmTokenContractAddress(contracts, provider, assetName)

  // 0 = WELL/MFAM, 1 = GLMR/MOVR
  const supplyRewardSpeed = new BigNumber((await comptroller.supplyRewardSpeeds(1, contracts.MARKETS[assetName].mTokenAddress)).toString())

  if (supplyRewardSpeed.isEqualTo(expectedSupplySpeed)){
    console.log(`    ✅  The SUPPLY speed on the ${assetName} market is set to ${supplyRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec`)
  } else {
    throw new Error(`The supply speed for ${assetName} was expected to be ${expectedSupplySpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec, found ${supplyRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec instead`)
  }

  const borrowRewardSpeed = new BigNumber((await comptroller.borrowRewardSpeeds(1, contracts.MARKETS[assetName].mTokenAddress)).toString())

  if (borrowRewardSpeed.isEqualTo(expectedBorrowSpeed)){
    console.log(`    ✅  The BORROW speed on the ${assetName} market is set to ${borrowRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec`)
  } else {
    throw new Error(`The borrow speed for ${assetName} was expected to be ${expectedBorrowSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec, found ${borrowRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec instead`)
  }
}

export async function assertMarketNativeTokenRewardSpeedWithAddress(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, mTokenAddress: string, expectedSupplySpeed: BigNumber, expectedBorrowSpeed: BigNumber){
  const comptroller = contracts.COMPTROLLER.getContract(provider)
  // const mTokenAddress = await getmTokenContractAddress(contracts, provider, assetName)

  // 0 = WELL/MFAM, 1 = GLMR/MOVR
  const supplyRewardSpeed = new BigNumber((await comptroller.supplyRewardSpeeds(1, mTokenAddress)).toString())

  if (supplyRewardSpeed.isEqualTo(expectedSupplySpeed)){
    console.log(`    ✅  The SUPPLY speed on the ${mTokenAddress} market is set to ${supplyRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec`)
  } else {
    throw new Error(`The supply speed for ${mTokenAddress} was expected to be ${expectedSupplySpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec, found ${supplyRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec instead`)
  }

  const borrowRewardSpeed = new BigNumber((await comptroller.borrowRewardSpeeds(1, mTokenAddress)).toString())

  if (borrowRewardSpeed.isEqualTo(expectedBorrowSpeed)){
    console.log(`    ✅  The BORROW speed on the ${mTokenAddress} market is set to ${borrowRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec`)
  } else {
    throw new Error(`The borrow speed for ${mTokenAddress} was expected to be ${expectedBorrowSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec, found ${borrowRewardSpeed.div(1e18).toFixed(18)} ${nativeTicker(contracts)}/sec instead`)
  }
}

export async function assertMarketGovTokenRewardSpeedWithAddress(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, mTokenAddress: string, expectedSupplySpeed: BigNumber, expectedBorrowSpeed: BigNumber){
  const unitroller = contracts.COMPTROLLER.getContract(provider)

  // const mTokenAddress = await getmTokenContractAddress(contracts, provider, assetName)

  // 0 = WELL, 1 = GLMR
  const supplyRewardSpeed = new BigNumber((await unitroller.supplyRewardSpeeds(0, mTokenAddress)).toString())

  if (supplyRewardSpeed.isEqualTo(expectedSupplySpeed)){
    console.log(`    ✅  The SUPPLY speed on the ${mTokenAddress} market is set to ${supplyRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec`)
  } else {
    throw new Error(`The supply speed for ${mTokenAddress} was expected to be ${expectedSupplySpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec, found ${supplyRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec instead`)
  }

  const borrowRewardSpeed = new BigNumber((await unitroller.borrowRewardSpeeds(0, mTokenAddress)).toString())

  if (borrowRewardSpeed.isEqualTo(expectedBorrowSpeed)){
    console.log(`    ✅  The BORROW speed on the ${mTokenAddress} market is set to ${borrowRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec`)
  } else {
    throw new Error(`The borrow speed for ${mTokenAddress} was expected to be ${expectedBorrowSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec, found ${borrowRewardSpeed.div(1e18).toFixed(18)} ${govTokenTicker(contracts)}/sec instead`)
  }
}


export async function assertMarketBorrowIsPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const result = await comptroller.borrowGuardianPaused(market.mTokenAddress)

  if (result === false){
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market borrow is paused`)
  }
}
export async function assertMarketBorrowIsNOTPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const result = await comptroller.borrowGuardianPaused(market.mTokenAddress)

  if (result === true){
    throw new Error(`The ${market.name} market was expected to NOT be paused but was!`)
  } else {
    console.log(`    ✅ ${market.name} market borrow IS NOT paused`)
  }
}

export async function assertMarketSupplyingIsPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const result = await comptroller.mintGuardianPaused(market.mTokenAddress)

  if (result === false){
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market supply is paused`)
  }
}
export async function assertMarketSupplyingIsNOTPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const result = await comptroller.mintGuardianPaused(market.mTokenAddress)

  if (result === true){
    throw new Error(`The ${market.name} market was expected to be paused but wasn't!`)
  } else {
    console.log(`    ✅ ${market.name} market supply IS NOT paused`)
  }
}

export async function assertMarketCFIsNonZero(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const marketData = await comptroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (marketData.collateralFactorMantissa.isZero()){
    throw new Error(`The ${market.name} market has CF=${mantissaFormatted.times(100)}%, which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}
export async function assertMarketCFIsZero(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const marketData = await comptroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (!marketData.collateralFactorMantissa.isZero()){
    throw new Error(`The ${market.name} market has that is NONZERO (${mantissaFormatted.times(100)}%), which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}

export async function assertMarketCFEqualsPercent(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market, expectedPercent: number){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const marketData = await comptroller.markets(market.mTokenAddress)

  const mantissaFormatted = new BigNumber(marketData.collateralFactorMantissa.toString()).div(1e18)

  if (!mantissaFormatted.times(100).isEqualTo(expectedPercent)){
    throw new Error(`The ${market.name} market has that DOES NOT EQUAL (${expectedPercent}%), which was not expected!`)
  } else {
    console.log(`    ✅ ${market.name} Collateral Factor is currently set to ${mantissaFormatted.times(100)}%`)
  }
}

export async function assertMarketRFIsNOTOneHundred(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, market: Market){
  const mToken = new ethers.Contract(
      market.mTokenAddress,
      getDeployArtifact('MToken').abi,
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
      getDeployArtifact('MToken').abi,
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
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const transferGuardianPaused = await comptroller.transferGuardianPaused()

  if (transferGuardianPaused === false){
    throw new Error(`Transfers are NOT paused, and expected to be paused`)
  } else {
    console.log(`    ✅ Comptroller transfer guardian IS currently paused/engaged`)
  }
}

export async function assertTransferGuardianIsNotPaused(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle){
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const transferGuardianPaused = await comptroller.transferGuardianPaused()

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
  const unitroller = contracts.COMPTROLLER.getContract(provider)

  // Note that we fetch contracts from the unitroller, rather than using the static list in moonwell.js. This avoids the case
  // where a future version of moonwell.js includes a new market which would break this assertion.
  const allMarkets = await unitroller.getAllMarkets()

  const marketContracts = allMarkets.map((market: string) => {
    return getContract('MErc20Delegator', market, provider)
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
  const unitroller = contracts.COMPTROLLER.getContract(provider)

  // Note that we fetch contracts from the unitroller, rather than using the static list in moonwell.js. This avoids the case
  // where a future version of moonwell.js includes a new market which would break this assertion.
  const allMarkets = await unitroller.getAllMarkets()

  const marketContracts = allMarkets.map((market: string) => {
    return getContract('MErc20Delegator', market, provider)
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
  const oracle = contracts.ORACLE.getContract(provider)

  const feed = await oracle.getFeed(targetSymbol)
  if (feed !== ethers.constants.AddressZero) {
    throw new Error(`There is a feed registered for symbol ${targetSymbol}`)
  }
  console.log(`    ✅ No Chainlink Feed registered`)
}

/**
 * Assert Chainlink returns a non-zero price for the asset backing the given mToken.
 * 
 * @param provider An ethers provider.
 * @param contracts A contract bundle.
 * @param mtokenAddress The market to inspect.
 */
 export async function assertChainlinkPricePresent(provider: ethers.providers.JsonRpcProvider, contracts: ContractBundle, mtokenAddress: string) {
  const oracle = contracts.ORACLE.getContract(provider)

  const price = await oracle.getUnderlyingPrice(mtokenAddress)
  if (price.eq(0)) {
    throw new Error(`Was unable to retrieve a price for ${mtokenAddress}`)
  }
  console.log(`    ✅ Chainlink Feed returns a price`)
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
  const oracle = contracts.ORACLE.getContract(provider)

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
 * @param marketAddress The address of the market.
 * @param expectedCollateralFactor The expected value.
 */
export async function assertCF(
  provider: ethers.providers.JsonRpcProvider, 
  contracts: ContractBundle,
  marketAddress: string,
  expectedCollateralFactor: number
) {
  const comptroller = contracts.COMPTROLLER.getContract(provider)

  const marketData = await comptroller.markets(marketAddress)
  const collateralFactor = marketData.collateralFactorMantissa
  const expected = percentTo18DigitMantissa(expectedCollateralFactor)
  if (!collateralFactor.eq(expected)) {
    throw new Error(`Unexpected Collateral Factor value in market ${marketAddress}. Expected: ${expected}, Actual: ${collateralFactor.toString()}`)
  }
  console.log(`    ✅ Collateral Factor share set correctly.`)
}

/**
 * Assert the reserve factor of a market is the expected value.
 * 
 * @param provider An ethers provider.
 * @param marketAddress The address of the market.
 * @param expectedRFPercent The expected value.
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
  console.log(`    ✅ Reserve Factor set correctly.`)
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
 * @param contracts A contract bundle.
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