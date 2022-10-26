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
  assertChainlinkPricePresent, 
} from "../../src/verification/assertions";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import { percentTo18DigitMantissa, sleep } from "../../src";

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


  const unitroller = new ethers.Contract(
    contracts.COMPTROLLER!,
    require('../../src/abi/Unitroller.json').abi,
    provider
  )

  await assertStorageAddress(unitroller, contracts.TIMELOCK!, 'admin')

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

    const token = new ethers.Contract(
      tokenAddress,
      require('../../src/abi/MErc20Delegator.json').abi,
      provider
    )
    // await assertStorageString(token, 'Axelar Wrapped ATOM', 'name')
    // await assertStorageString(token, 'axlATOM', 'symbol')

    await assertChainlinkPricePresent(provider, contracts, expectedMarketAddress)

    // Economic parameters on market are correct
    await assertMarketRF(provider, expectedMarketAddress, reserveFactoryPercent)
    await assertMarketSeizeShare(provider, expectedMarketAddress, protocolSeizeSharePercent)

    // Market is admin'ed correctly by the timelock.
    await assertTimelockIsAdminOfMarket(provider, contracts, expectedMarketAddress)

    // Unitroller has the market listed with the correct collateral factor
    await assertMarketIsListed(provider, contracts, tokenAddress, expectedMarketAddress)
    await assertCF(provider, contracts, expectedMarketAddress, collateralFactorPercent)
    
    await assertChainlinkFeedIsRegistered(provider, contracts, tokenSymbol, chainlinkFeedAddress)


  //   console.log("[+] Breaking Glass")


  // const timelockAddr = contracts.TIMELOCK!
  // console.log(`Connecting to timelock at ${timelockAddr}`)

  // const breakGlassGuardian = provider.getSigner("0x5402447a0db03eee98c98b924f7d346bd19cdd17")
  // const govRetGuardianAddr =  provider.getSigner("0xffa353dacd27071217ea80d3149c9d500b0e9a38")
  // const govAddr = contracts.GOVERNOR!

  // const governor = new ethers.Contract(
  //   govAddr,
  //   require('../../src/abi/MoonwellGovernorArtemis.json').abi,
  //   provider
  // )

  // const r0 = await governor.connect(breakGlassGuardian).__executeBreakGlassOnCompound([contracts.COMPTROLLER])
  // await r0.wait()
  // console.log('glass broken in ' + r0.hash)


  // const r1 = await unitroller.connect(govRetGuardianAddr)._acceptAdmin()
  // await r1.wait()
  // console.log('accept admin in ' + r1.hash)

  // await assertStorageAddress(unitroller, '0xffa353dacd27071217ea80d3149c9d500b0e9a38', 'admin')


  // console.log("[+] Setting CollatFact")

  // const comptroller = new ethers.Contract(
  //   contracts.COMPTROLLER!,
  //   require('../../src/abi/Comptroller.json').abi,
  //   provider
  // )

  // console.log(`Market: ${expectedMarketAddress}`)
  // console.log('Collateral Factor: ' + collateralFactorPercent + '%')
  // const cf = percentTo18DigitMantissa(collateralFactorPercent)
  // console.log('Collateral Factor Raw: ' + cf.toString())

  
  // const result = await comptroller.connect(govRetGuardianAddr)._setCollateralFactor(expectedMarketAddress, cf)
  // await result.wait()
  // console.log(`Set CF in ${result.hash}`)


  // console.log(`RESULT: ${JSON.stringify(result, null, 2)}`)
  // const receipt = await provider.getTransactionReceipt(result.hash)
  
  // console.log(`RECEIPT: ${JSON.stringify(receipt, null, 2)}`)
  // for (let i = 0; i < receipt.logs.length; i++ ) {
  //     const log = receipt.logs[i]
  //     if (log.address.toUpperCase() === contracts.COMPTROLLER.toUpperCase()) {
  //         console.log("COMPTROLLER")
  //         console.log(comptroller.interface.parseLog(log))
  //     } else {
  //       console.log("~~~UNKNOWN?!~~~~@")
  //     }
  // }
  //   await assertCF(provider, contracts, expectedMarketAddress, collateralFactorPercent)
}


// 0x000000000000000000000000b5f1609e90f896b7464df7967298fe869e37e4b1000000000000000000000000000000000000000000000000058d15e176280000
// 0x000000000000000000000000b5f1609e90f896b7464df7967298fe869e37e4b1000000000000000000000000000000000000000000000000058d15e176280000