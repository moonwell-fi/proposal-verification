import {Contracts} from '@moonwell-fi/moonwell.js'
import {passGovProposal, setupDeployerAndEnvForGovernance, sleep, startGanache} from "../../src";
import {ethers} from "ethers";

import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";

const wellTreasuryAddress = "0x519ee031E182D3E941549E7909C9319cFf4be69a";

const FORK_BLOCK = 1757073

test("market-deployer with a single market", async () => {
  const contracts = Contracts.moonbeam

  const fGLMRLM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
  const cGLMRAPPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

  const forkedChainProcess = await startGanache(
      contracts,
      FORK_BLOCK,
      'https://rpc.api.moonbeam.network',
      [fGLMRLM, cGLMRAPPDEV]
  )

  console.log("Waiting 5 seconds for chain to bootstrap...")
  await sleep(5)

  try {
        const tokensToList = ["0x27292cf0016e5df1d8b37306b2a98588acbd6fca"] // axlATOM
        const chainlinkAddresses = ["0x4F152D143c97B5e8d2293bc5B2380600f274a5dd"] // ATOM
        const tokenSymbols = ["axlATOM"]
        const tokenDecimals = [6]
        const mTokenNames = ["Moonwell axlATOM"]
        const mTokenSymbols = ["maxlATOM"]
        const reserveFactorPercents = [60]
        const protocolSeizeSharePercents = [10]
        const collateralFactorPercents = [40]

        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key, delegate those well to itself, and assert it has voting power
        await setupDeployerAndEnvForGovernance(contracts, provider, wellTreasuryAddress, FORK_BLOCK)

        // Assert that a market is not listed for the token and a chainlink feed is not registered.
        await assertCurrentExpectedState(provider, contracts, tokensToList, chainlinkAddresses)

        // Generate proposal data
        const deployer = await provider.getSigner(0)
        const {proposal, mTokenDeployResults} = await generateProposalData(
          deployer,
          tokensToList,
          chainlinkAddresses,
          tokenSymbols,
          tokenDecimals,
          mTokenNames,
          mTokenSymbols,
          reserveFactorPercents,
          protocolSeizeSharePercents,
          collateralFactorPercents,
        )

        // Pass the proposal
        await passGovProposal(contracts, provider, proposal)

        // Assert the market is correctly admin'ed, with the right economic parameters and has the right storage set.
        // Assert that a chainlink feed has been registered.
        await assertExpectedEndState(
          provider,
          contracts, 
          tokensToList,
          chainlinkAddresses,
          tokenSymbols,
          mTokenNames,
          mTokenSymbols,
          reserveFactorPercents,
          protocolSeizeSharePercents,
          collateralFactorPercents,
          mTokenDeployResults.map((deployResult) => { return deployResult.contractAddress }),
        )
  } finally {
      // Kill our child chain.
      console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
      process.kill(-forkedChainProcess.pid!)
      console.log("Ganache chain stopped.")
  }
});

test("market-deployer with 3 markets", async () => {
  const contracts = Contracts.moonbeam

  const fGLMRLM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
  const cGLMRAPPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

  const forkedChainProcess = await startGanache(
      contracts,
      FORK_BLOCK,
      'https://rpc.api.moonbeam.network',
      [fGLMRLM, cGLMRAPPDEV]
  )

  console.log("Waiting 5 seconds for chain to bootstrap...")
  await sleep(5)

  try {
        const tokensToList = [
          "0x27292cf0016e5df1d8b37306b2a98588acbd6fca", 
          "0xca01a1d0993565291051daff390892518acfad3a",
          "0x61C82805453a989E99B544DFB7031902e9bac448",
        ]
        const chainlinkAddresses = [
          "0x4F152D143c97B5e8d2293bc5B2380600f274a5dd", 
          "0xA122591F60115D63421f66F752EF9f6e0bc73abC",
          "0x05Ec3Fb5B7CB3bE9D7150FBA1Fb0749407e5Aa8a",
        ]
        const tokenSymbols = [
          "axlATOM", 
          "axlUSDC",
          "axlFRAX",
        ]
        const tokenDecimals = [6, 6, 18]
        const mTokenNames = ["Moonwell axlATOM", "Moonwell AXL USDC", "Moonwell AXL FRAX"]
        const mTokenSymbols = ["maxlATOM", "maxlUSDC", "maxlFRAX"]
        const reserveFactorPercents = [60, 65, 70]
        const protocolSeizeSharePercents = [10, 15, 20]
        const collateralFactorPercents = [40, 45, 50]

        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key, delegate those well to itself, and assert it has voting power
        await setupDeployerAndEnvForGovernance(contracts, provider, wellTreasuryAddress, FORK_BLOCK)

        // Assert that a market is not listed for the token and a chainlink feed is not registered.
        await assertCurrentExpectedState(provider, contracts, tokensToList, chainlinkAddresses)

        // Generate proposal data
        const deployer = await provider.getSigner(0)
        const {proposal, mTokenDeployResults} = await generateProposalData(
          deployer,
          tokensToList,
          chainlinkAddresses,
          tokenSymbols,
          tokenDecimals,
          mTokenNames,
          mTokenSymbols,
          reserveFactorPercents,
          protocolSeizeSharePercents,
          collateralFactorPercents,
        )

        // Pass the proposal
        await passGovProposal(contracts, provider, proposal)

        // Assert the market is correctly admin'ed, with the right economic parameters and has the right storage set.
        // Assert that a chainlink feed has been registered.
        await assertExpectedEndState(
          provider,
          contracts, 
          tokensToList,
          chainlinkAddresses,
          tokenSymbols,
          mTokenNames,
          mTokenSymbols,
          reserveFactorPercents,
          protocolSeizeSharePercents,
          collateralFactorPercents,
          mTokenDeployResults.map((deployResult) => { return deployResult.contractAddress }),
        )
  } finally {
      // Kill our child chain.
      console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
      process.kill(-forkedChainProcess.pid!)
      console.log("Ganache chain stopped.")
  }
});
