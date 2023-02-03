import {Contracts} from '@moonwell-fi/moonwell.js'
import {passGovProposal, setupDeployerAndEnvForGovernance, sleep, startGanache} from "../../../src";
import {ethers} from "ethers";

import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";

const wellTreasuryAddress = "0x519ee031E182D3E941549E7909C9319cFf4be69a";

const FORK_BLOCK = 1757073

test("mip-1-verifications", async () => {
    console.log("This ganache chain will automatically be killed when this program ends.")
    console.log()

    const contracts = Contracts.moonbeam

    const forkedChainProcess = await startGanache(contracts, FORK_BLOCK, 'https://rpc.api.moonbeam.network', [wellTreasuryAddress])

    console.log("Waiting 5 seconds for chain to bootstrap...")
    await sleep(5)
    console.log()

    try {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key, delegate those well to itself, and assert it has voting power
        await setupDeployerAndEnvForGovernance(contracts, provider, wellTreasuryAddress, FORK_BLOCK)

        // Assert the current state is as we think it is (CF set for nomad assets, borrowing and supplying disabled globally, etc)
        await assertCurrentExpectedState(contracts, provider)

        // Generate proposal data
        const proposalData = await generateProposalData(contracts, provider)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        // Assert that our end state is as desired
        await assertExpectedEndState(contracts, provider)
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
        console.log()
    }
});
