import { deployAndWireMarket } from '@moonwell-fi/market-deployer'
import MarketConfiguration from '@moonwell-fi/market-deployer/dist/types/market-configuration';
import { Environment } from '@moonwell-fi/moonwell.js';

export const generateProposalData = async (
  deployer: any,
  tokenAddresses: Array<string>,
  chainlinkFeedAddresses: Array<string>,
  tokenSymbols: Array<string>,
  tokenDecimals: Array<number>,
  mTokenNames: Array<string>,
  mTokenSymbols: Array<string>,
  reserveFactoryPercents: Array<number>,
  protocolSeizeSharePercents: Array<number>,
  collateralFactorPercents: Array<number>,
  borrowCaps: Array<number>
) => {
  console.log("[+] Deploying Market ")

  const deploymentConfiguration = {
    networkName: 'moonbeam',
    environment: Environment.MOONBEAM,
    deployer,
    requiredConfirmations: 1,
    numMarkets: tokenAddresses.length
  }
  const marketConfigurations: Array<MarketConfiguration> = []
  for (let i = 0; i < tokenAddresses.length; i++) {
    marketConfigurations.push(
      {
        tokenAddress: tokenAddresses[i],
        chainlinkFeedAddress: chainlinkFeedAddresses[i],
        tokenSymbol: tokenSymbols[i],
        tokenDecimals: tokenDecimals[i],
        mTokenName: mTokenNames[i],
        mTokenSymbol: mTokenSymbols[i],
        reserveFactor: reserveFactoryPercents[i],
        protocolSeizeShare: protocolSeizeSharePercents[i],
        collateralFactor: collateralFactorPercents[i],
        borrowCap: borrowCaps[i]
      }
    )
  }

  const { proposal, mTokenDeployResults } = await deployAndWireMarket(
    marketConfigurations,
    deploymentConfiguration
  )

  for (let i = 0; i < mTokenDeployResults.length; i++) {
  console.log(`    ✅ Market deployed at ${mTokenDeployResults[i].contractAddress}.`)
  }

  return { proposal, mTokenDeployResults}
}