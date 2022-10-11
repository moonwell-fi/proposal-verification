import {ethers} from "ethers";
import BigNumber from "bignumber.js";
import {ContractBundle, Market} from "@moonwell-fi/moonwell.js";

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
