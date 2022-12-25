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
import {fMOVRGrant} from "./vars";

const FORK_BLOCK = 3261444

const EXPECTED_USDC_COLLATERAL_FACTOR  = 1234567

test("mip-12-verifications", async () => {

    const contracts = Contracts.moonriver

    const forkedChainProcess = await startGanache(
        contracts,
        FORK_BLOCK,
        'https://rpc.api.moonriver.moonbeam.network',
        [fMOVRGrant]
    )

    console.log("Waiting 5 seconds for chain to bootstrap...")
    await sleep(5)

    try {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer MFAM to the deployer key from the fMOVRGrant treasury, delegate those well to the deployer,
        // and assert the deployer has enough voting power to pass a proposal
        await setupDeployerAndEnvForGovernance(contracts, provider, fMOVRGrant, FORK_BLOCK)

        await assertCurrentExpectedState(contracts, provider)

        // Generate new proposal data
        const proposalData = await generateProposalData(contracts, provider)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        // Assert that our end state is as desired
        await assertExpectedEndState(contracts, provider, EXPECTED_USDC_COLLATERAL_FACTOR)
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
