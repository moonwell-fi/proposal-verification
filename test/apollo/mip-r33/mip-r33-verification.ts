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
import {F_MOVR_GRANT, FORK_BLOCK, RPC_URL} from "./vars";

test("mip-r33-verification", async () => {
    console.log("\n===========================================")
    console.log("MIP-R33: Pause Supply Emissions on Moonriver")
    console.log("===========================================\n")
    console.log("Summary: This proposal pauses supply-side token emissions")
    console.log("for MOVR, xcKSM, and FRAX markets on Moonriver.")
    console.log("Supply emissions will be set to 0, borrow emissions set to 1.\n")

    const contracts = Contracts.moonriver

    const forkedChainProcess = await startGanache(contracts,
        FORK_BLOCK,
        RPC_URL,
        [F_MOVR_GRANT]
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

        console.log("\n[+] Proposal Summary:")
        console.log(`    - Total actions: ${proposalData.targets.length}`)
        console.log(`    - Markets: MOVR, xcKSM, FRAX`)
        console.log(`    - Supply emissions: 0 (paused)`)
        console.log(`    - Borrow emissions: 1`)
        console.log(`    - Both GOVTOKEN (WELL) and NATIVE (MOVR) rewards affected\n`)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        // Assert that our end state is as desired
        await assertExpectedEndState(contracts, provider)

        console.log("\n✅ MIP-R33 verification complete!")
        console.log("Supply emissions successfully paused on Moonriver\n")
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
