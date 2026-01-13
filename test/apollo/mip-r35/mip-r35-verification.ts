import {ethers, BigNumber as EthersBigNumber} from 'ethers'
import {
    passGovProposal,
    setupDeployerAndEnvForGovernance,
    sleep,
    startGanache,
    replaceXCAssetWithDummyERC20
} from "../../../src";

import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData";
import {assertCurrentExpectedState} from "./assertCurrentExpectedState";
import {assertExpectedEndState} from "./assertExpectedEndState";
import {F_MOVR_GRANT, FORK_BLOCK, RPC_URL, COLLATERAL_FACTOR_CHANGES} from "./vars";

// Helper function to set MFAM balance directly using storage manipulation
async function setMFAMBalance(provider: ethers.providers.JsonRpcProvider, address: string, amount: EthersBigNumber) {
    const govTokenAddress = Contracts.moonriver.GOV_TOKEN.address

    // MFAM uses mapping(address => uint96) balances at slot 1 (not slot 0!)
    // Storage slot = keccak256(abi.encode(address, slot))
    const paddedAddress = ethers.utils.hexZeroPad(address, 32)
    const paddedSlot = ethers.utils.hexZeroPad('0x01', 32)
    const slot = ethers.utils.keccak256(paddedAddress + paddedSlot.slice(2))

    // Set the balance - MFAM uses uint96, but we can set the full word
    await provider.send('evm_setAccountStorageAt', [
        govTokenAddress,
        slot,
        ethers.utils.hexZeroPad(amount.toHexString(), 32)
    ])
}

test("mip-r35-verification", async () => {
    console.log("\n===========================================")
    console.log("MIP-R35: Moonriver Collateral Factor Changes")
    console.log("===========================================\n")
    console.log("Summary: This proposal reduces collateral factors")
    console.log("for all 3 Moonriver markets as part of the wind-down process.")
    console.log("Collateral factors: xcKSM=25%, MOVR=25%, FRAX=25%\n")

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

        // At recent blocks, F_MOVR_GRANT is empty. Inject MFAM tokens directly.
        const quorumAmount = EthersBigNumber.from('50000000').mul(EthersBigNumber.from(10).pow(18)) // 50M MFAM
        await setMFAMBalance(provider, F_MOVR_GRANT, quorumAmount)
        console.log("[+] Injected 50M MFAM into F_MOVR_GRANT for governance testing")

        // Mock xcKSM XC-20 precompile with a dummy ERC20
        // Ganache doesn't properly handle XC-20 precompiles, causing symbol() to fail
        await replaceXCAssetWithDummyERC20(
            provider,
            contracts.MARKETS['FRAX'],  // Clone from FRAX (regular ERC20)
            contracts.MARKETS['xcKSM']  // Replace xcKSM XC-20 precompile
        )
        // Set the symbol storage slot to "xcKSM" (slot 4 for OpenZeppelin ERC20)
        const symbolBytes = ethers.utils.formatBytes32String('xcKSM')
        const symbolWithLength = EthersBigNumber.from(symbolBytes).add('xcKSM'.length * 2).toHexString()
        await provider.send('evm_setAccountStorageAt', [
            contracts.MARKETS['xcKSM'].tokenAddress,
            ethers.utils.hexZeroPad('0x04', 32), // slot 4 = _symbol
            ethers.utils.hexZeroPad(symbolWithLength, 32)
        ])
        console.log("[+] Mocked xcKSM XC-20 precompile with dummy ERC20 for Ganache testing")

        // Note: Using current on-chain collateral factors (pre-MIP-R33)
        // xcKSM=59%, MOVR=60%, FRAX=50%

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
        console.log(`    - Markets: xcKSM, MOVR, FRAX`)
        console.log(`    - Collateral factors: xcKSM=25%, MOVR=25%, FRAX=25%\n`)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        // Assert that our end state is as desired
        await assertExpectedEndState(contracts, provider)

        console.log("\n✅ MIP-R35 verification complete!")
        console.log("Collateral factors reduced on all 3 Moonriver markets\n")
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
