import {ethers} from 'ethers'
import {
    passGovProposal,
    setupDeployerAndEnvForGovernance,
    sleep,
    startGanache, replaceXCAssetWithDummyERC20
} from "../../../src";

import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";
import {C_GLMR_APPDEV, F_GLMR_LM} from "./vars";
import BigNumber from "bignumber.js";

const FORK_BLOCK = 3_040_102

test("mip-31-verifications", async () => {

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

        // Patch xcDOT asset with FRAX
        await replaceXCAssetWithDummyERC20(
            provider,
            contracts.MARKETS['FRAX'], // Use the FRAX contracts
            contracts.MARKETS['xcDOT'] // To override the xcDOT contracts and allow the calls to succeed
        )

        // Patch the symbol for our fake `xcDOT` to be `xcDOT` so oracle lookups work correctly
        await provider.send('evm_setAccountStorageAt', [
            // Target
            contracts.MARKETS['xcDOT'].tokenAddress,
            // Slot
            ethers.utils.hexZeroPad("0x" + (4).toString(16), 32),
            // New Data
            new BigNumber(
                ethers.utils.formatBytes32String('xcDOT')
            )
                .plus('xcDOT'.length * 2) // Storage strings are UTF-8 and have their size encoded into them, so double ascii length and add this to the message
                .toString(16) // Format as a hex string
                .replace(/^/, '0x') // Add 0x prefix
        ])

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
