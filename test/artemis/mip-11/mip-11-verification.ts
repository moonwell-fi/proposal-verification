import {ethers} from 'ethers'
import {
    passGovProposal,
    setupDeployerAndEnvForGovernance,
    sleep,
    startGanache
} from "../../../src";

import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData";
import {generateProposalData as MIP7GenerateProposalData} from "../mip-7/generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";
import {C_GLMR_APPDEV, F_GLMR_LM} from "./vars";

const FORK_BLOCK = 2410962

test("mip-11-verifications", async () => {

    const contracts = Contracts.moonbeam

    const forkedChainProcess = await startGanache(contracts,
        FORK_BLOCK,
        'https://rpc.api.moonbeam.network',
        [F_GLMR_LM, C_GLMR_APPDEV]
    )

    console.log("Waiting 5 seconds for chain to bootstrap...")
    await sleep(5)

    try {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key from the cGLMRAPPDEV treasury, delegate those well to the deployer,
        // and assert the deployer has enough voting power to pass a proposal
        await setupDeployerAndEnvForGovernance(contracts, provider, C_GLMR_APPDEV, FORK_BLOCK)

        await assertCurrentExpectedState(contracts, provider)

        // Go pass MIP-7
        console.log('[+] Passing MIP-7...')
        const mip7 = await MIP7GenerateProposalData()
        await passGovProposal(contracts, provider, mip7.proposal, 0, false)

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
