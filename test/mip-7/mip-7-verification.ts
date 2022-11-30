import {Contracts} from '@moonwell-fi/moonwell.js'
import {passGovProposal, setupDeployerAndEnvForGovernance, sleep, startGanache} from "../../src";
import {ethers} from "ethers";

import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";

const wellTreasuryAddress = "0x519ee031E182D3E941549E7909C9319cFf4be69a";

const FORK_BLOCK = 2399077

test("mip 7", async () => {
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
          "0xab3f0245b83feb11d15aaffefd7ad465a59817ed", // ETH.wh
          "0xe57ebd2d67b462e9926e04a8e33f01cd0d64346d", // BTC.wh
          "0x931715fee2d06333043d11f658c8ce934ac61d0c", // USDC.wh
        ]

        const chainlinkAddresses = [
          "0x9ce2388a1696e22F870341C3FC1E89710C7569B5", // ETH
          "0x8211B991d713ddAE32326Fd69E1E2510F4a653B0", // WBTC
          "0xA122591F60115D63421f66F752EF9f6e0bc73abC", // USDC
        ]

        const tokenSymbols = [
          "WETH", // ETH
          "WBTC", // WBTC
          "USDC", // USDC
        ]

        const tokenDecimals = [
          18, // ETH
          8, // BTC
          6 // USDC
        ]
        const mTokenNames = [
          "Moonwell ETH.wh",
          "Moonwell WBTC.wh",
          "Moonwell USDC.wh",
        ]
        const mTokenSymbols = [
          "mETH.wh",
          "mWBTC.wh",
          "mUSDC.wh"
        ]
        const reserveFactorPercents = [
          25, // ETH
          25, // BTC
          15, // USDC
        ]
        const protocolSeizeSharePercents = [
          3, 
          3, 
          3
        ]
        const collateralFactorPercents = [
          10, 
          10, 
          10
        ]
        const borrowCaps = [
          210, // ETH
          15, // BTC
          250000 // USDC
        ]

        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key, delegate those well to itself, and assert it has voting power
        await setupDeployerAndEnvForGovernance(contracts, provider, wellTreasuryAddress, FORK_BLOCK)

        // Assert that a market is not listed for the token and a chainlink feed is not registered.
        await assertCurrentExpectedState(provider, contracts, tokensToList, chainlinkAddresses)

        // Generate proposal data
        const deployer = await provider.getSigner(0)
        const {proposal, mTokenDeployResults} = await generateProposalData()

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
          borrowCaps,
          tokenDecimals,
          mTokenDeployResults.map((deployResult) => { return deployResult.contractAddress }),
        )
  } finally {
      // Kill our child chain.
      console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
      process.kill(-forkedChainProcess.pid!)
      console.log("Ganache chain stopped.")
  }
});
