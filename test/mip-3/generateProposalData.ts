import { deployAndWireMarket } from '../../market-deployer/src/index'
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

  const contractFactory = new ethers.ContractFactory(
    require('../../src/abi/MErc20Delegator.json').abi,
    require('../../src/abi/MErc20Delegator.json').bytecode,
    deployer
  )

  const deploymentConfiguration = {
    deployer,
    contractFactory
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