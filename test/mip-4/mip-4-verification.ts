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

const FORK_BLOCK = 2858953 // One block before the real prop went in

test("mip-4-verifications", async () => {
    const contracts = Contracts.moonriver

    const GAUNTLET_MULTISIG = '0xa28b7d23e9f8d8d5346a7901ecc9ec8ea48baecd'
    const fMOVRGrant = '0x45DD368E30C07804b037260071d332e547C874F0'

    const forkedChainProcess = await startGanache(
        contracts,
        FORK_BLOCK,
        'https://rpc.api.moonriver.moonbeam.network',
        [fMOVRGrant, GAUNTLET_MULTISIG]
    )

    console.log("Waiting 5 seconds for chain to bootstrap...")
    await sleep(5)

    try {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key from the cGLMRAPPDEV treasury, delegate those well to the deployer,
        // and assert the deployer has enough voting power to pass a proposal
        await setupDeployerForGovernance(contracts, provider, fMOVRGrant)

        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['ETH.multi'],
            60
        )
        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['USDT.multi'],
            40
        )
        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['FRAX'],
            60
        )

        // Generate new proposal data
        const proposalData = await generateProposalData(contracts, provider)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['ETH.multi'],
            62
        )
        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['USDT.multi'],
            42
        )
        await assertMarketCFEqualsPercent(
            provider, contracts, contracts.MARKETS['FRAX'],
            59.5
        )
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
