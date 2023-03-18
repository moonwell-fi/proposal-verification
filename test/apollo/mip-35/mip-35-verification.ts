import {ethers} from 'ethers'
import {
    passGovProposal,
    setupDeployerAndEnvForGovernance,
    sleep,
    startGanache
} from "../../../src";

import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";
import {F_MOVR_GRANT, SUBMITTER_WALLET} from "./vars";

const FORK_BLOCK = 3_839_616

test("mip-35-verifications", async () => {
    const contracts = Contracts.moonriver

    const forkedChainProcess = await startGanache(contracts,
        FORK_BLOCK,
        'https://rpc.api.moonriver.moonbeam.network',
        [F_MOVR_GRANT, SUBMITTER_WALLET]
    )

    console.log("Waiting 5 seconds for chain to bootstrap...")
    await sleep(5)

    try {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        await setupDeployerAndEnvForGovernance(
            contracts,
            provider,
            F_MOVR_GRANT,
            FORK_BLOCK,
            5_000_000 // Quorum adjusts up just short of this amount when the proposal is submitted
        )

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
