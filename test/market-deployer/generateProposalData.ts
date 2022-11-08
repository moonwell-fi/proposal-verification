import { deployAndWireMarket } from '@moonwell-fi/market-deployer'
import { Environment } from '@moonwell-fi/moonwell.js';
import {ethers} from "ethers";


export const generateProposalData = async (
  deployer: any,
  tokenAddress: string,
  chainlinkFeedAddress: string,
  tokenSymbol: string,
  tokenDecimals: number,
  mTokenName: string,
  mTokenSymbol: string,
  reserveFactoryPercent: number,
  protocolSeizeSharePercent: number,
  collateralFactorPercent: number,
) => {
  console.log("[+] Deploying Market ")

  const deploymentConfiguration = {
    networkName: 'moonbeam',
    environment: Environment.MOONBEAM,
    deployer,
  }
  const marketConfiguration = {
    tokenAddress,
    chainlinkFeedAddress,
    tokenSymbol,
    tokenDecimals,
    mTokenName,
    mTokenSymbol,
    reserveFactor: reserveFactoryPercent,
    protocolSeizeShare: protocolSeizeSharePercent,
    collateralFactor: collateralFactorPercent
  }

  const { govProposal, mTokenDeployResult } = await deployAndWireMarket(
    marketConfiguration,
    deploymentConfiguration
  )

  console.log(`    ✅ Market deployed at ${mTokenDeployResult.contractAddress}.`)

  return { govProposal, mTokenDeployResult}
}