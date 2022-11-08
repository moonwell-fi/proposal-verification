import {ethers} from 'ethers'
import {
    passGovProposal,
    setupDeployerAndEnvForGovernance,
    sleep,
    startGanache
} from "../../src";

import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";

const FORK_BLOCK = 1966448

test("mip-2-verifications", async () => {

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
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key from the cGLMRAPPDEV treasury, delegate those well to the deployer,
        // and assert the deployer has enough voting power to pass a proposal
        await setupDeployerAndEnvForGovernance(contracts, provider, cGLMRAPPDEV, FORK_BLOCK)

        await assertCurrentExpectedState(contracts, provider)

        // Generate new proposal data
        const proposalData = await generateProposalData(contracts, provider)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        // Assert that our end state is as desired
        await assertExpectedEndState(contracts, provider)
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
