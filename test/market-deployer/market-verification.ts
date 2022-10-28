import {moonwellContracts} from '@moonwell-fi/moonwell.js'
import {passGovProposal, setupDeployerForGovernance, sleep, startGanache} from "../../src";
import {ethers} from "ethers";

import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";

const wellTreasuryAddress = "0x519ee031E182D3E941549E7909C9319cFf4be69a";

const FORK_BLOCK = 1757073

test("mip-3-verifications", async () => {
  const contracts = moonwellContracts.moonbeam

  const fGLMRLM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
  const cGLMRAPPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

  const forkedChainProcess = await startGanache(
      contracts,
      FORK_BLOCK,
      [fGLMRLM, cGLMRAPPDEV, '0x3a9249d70dCb4A4E9ef4f3AF99a3A130452ec19B', "0x5402447a0db03eee98c98b924f7d346bd19cdd17", "0xffa353dacd27071217ea80d3149c9d500b0e9a38"]
  )

  console.log("Waiting 5 seconds for chain to bootstrap...")
  await sleep(5)

  try {
        const tokenToList = "0x511ab53f793683763e5a8829738301368a2411e3"  //"0x27292cf0016e5df1d8b37306b2a98588acbd6fca" // axlATOM
        const chainlinkAddress = "0x4F152D143c97B5e8d2293bc5B2380600f274a5dd" // ATOM
        const tokenSymbol = "WELL" //  "axlATOM"
        const tokenDecimals = 18 //  6
        const mTokenName = "Moonwell WELL" // "Moonwell axlATOM"
        const mTokenSymbol = "mWELL" // "maxlATOM"
        const reserveFactorPercent = 60
        const protocolSeizeSharePercent = 10
        const collateralFactorPercent = 40

        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key, delegate those well to itself, and assert it has voting power
        await setupDeployerForGovernance(contracts, provider, wellTreasuryAddress)

        // Assert that a market is not listed for the token and a chainlink feed is not registered.
        await assertCurrentExpectedState(provider, contracts, tokenToList, chainlinkAddress)

        // Generate proposal data
        const deployer = await provider.getSigner(0)
        const {govProposal, mTokenDeployResult} = await generateProposalData(
          deployer,
          tokenToList,
          chainlinkAddress,
          tokenSymbol,
          tokenDecimals,
          mTokenName,
          mTokenSymbol,
          reserveFactorPercent,
          protocolSeizeSharePercent,
          collateralFactorPercent,
        )

        // Pass the proposal
        await passGovProposal(contracts, provider, govProposal)

        // Assert the market is correctly admin'ed, with the right economic parameters and has the right storage set.
        // Assert that a chainlink feed has been registered.
        await assertExpectedEndState(
          provider,
          contracts, 
          tokenToList,
          chainlinkAddress,
          tokenSymbol,
          mTokenName,
          mTokenSymbol,
          reserveFactorPercent,
          protocolSeizeSharePercent,
          collateralFactorPercent,
          mTokenDeployResult.contractAddress,
        )
  } finally {
      // Kill our child chain.
      console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
      process.kill(-forkedChainProcess.pid!)
      console.log("Ganache chain stopped.")
  }
});
