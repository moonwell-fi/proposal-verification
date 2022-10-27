import {ethers} from 'ethers'
import {
    passGovProposal,
    replaceXCAssetWithDummyERC20,
    setupDeployerForGovernance,
    sleep,
    startGanache
} from "../../src";

import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData";
import {assertMarketCFEqualsPercent} from "../../src/verification/assertions";

const FORK_BLOCK = 2157923 // One block before Gauntlet submitted on-chain - https://moonbeam.moonscan.io/tx/0x4260b3d206b5ac240cab05ea61d956225a610a9763be67fafffbefb6f4298097

test("mip-3-verifications", async () => {

    const contracts = Contracts.moonbeam

    const GAUNTLET_MULTISIG = '0x84165355afbfb553f3a58f1c6f3b5e2e7d7c244d'
    const cGLMRAPPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

    const forkedChainProcess = await startGanache(
        contracts,
        FORK_BLOCK,
        'https://rpc.api.moonbeam.network',
        [cGLMRAPPDEV, GAUNTLET_MULTISIG]
    )

    console.log("Waiting 5 seconds for chain to bootstrap...")
    await sleep(5)

    try {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go replace our xcDOT asset address with FRAX on a code/storage level
        await replaceXCAssetWithDummyERC20(
            provider,
            contracts.MARKETS['FRAX'], // Use the FRAX contracts
            contracts.MARKETS['xcDOT'] // To override the xcDOT contracts and allow the calls to succeed
        )

        // Go transfer WELL to the deployer key from the cGLMRAPPDEV treasury, delegate those well to the deployer,
        // and assert the deployer has enough voting power to pass a proposal
        await setupDeployerForGovernance(contracts, provider, cGLMRAPPDEV)

        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['xcDOT'],
            60
        )

        // Generate new proposal data
        const proposalData = await generateProposalData(contracts, provider)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['xcDOT'],
            62
        )
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
