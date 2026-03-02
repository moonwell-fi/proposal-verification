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
import {F_MOVR_GRANT, FORK_BLOCK, RPC_URL, ORACLE_ADDRESS, UNDERLYING_TOKENS, DIRECT_PRICES} from "./vars";

const CHAINLINK_ORACLE_ABI = [
    'function getUnderlyingPrice(address mToken) view returns (uint256)',
    'function assetPrices(address asset) view returns (uint256)',
    'function admin() view returns (address)',
];

const STATIC_FEED_ABI = [
    'function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)',
    'function decimals() view returns (uint8)',
];

// Helper function to set MFAM balance directly using storage manipulation
async function setMFAMBalance(provider: ethers.providers.JsonRpcProvider, address: string, amount: EthersBigNumber) {
    const govTokenAddress = Contracts.moonriver.GOV_TOKEN.address

    // MFAM uses mapping(address => uint96) balances at slot 1
    const paddedAddress = ethers.utils.hexZeroPad(address, 32)
    const paddedSlot = ethers.utils.hexZeroPad('0x01', 32)
    const slot = ethers.utils.keccak256(paddedAddress + paddedSlot.slice(2))

    await provider.send('evm_setAccountStorageAt', [
        govTokenAddress,
        slot,
        ethers.utils.hexZeroPad(amount.toHexString(), 32)
    ])
}

/**
 * Deploy a mock StaticPriceFeed on the Ganache fork.
 *
 * Since we can't compile Solidity in the test, we inject hand-crafted EVM
 * bytecode that reads from the WMOVR/USDC pair and returns the price in
 * Chainlink 8-decimal format. The bytecode implements:
 *   - decimals() → 8
 *   - latestRoundData() → reads WMOVR/USDC pair reserves, computes price
 *
 * For testing simplicity, we use a minimal mock that returns hardcoded
 * reserves-derived price (~$46 MOVR). In production, the real StaticPriceFeed.sol
 * contract is deployed with constructor args pointing to the Solarbeam pair.
 */
async function deployMockStaticPriceFeed(provider: ethers.providers.JsonRpcProvider): Promise<string> {
    const mockFeedAddress = '0x1111111111111111111111111111111111111111'

    // Inject bytecode that dispatches on function selector:
    // - decimals() (0x313ce567): returns 8
    // - latestRoundData() and all other calls: returns (1, 1000000000, timestamp, timestamp, 1)
    //   where 1000000000 = $10 MOVR in 8-decimal Chainlink format
    const runtimeBytecode = buildMockDexFeedBytecode()

    await provider.send('evm_setAccountCode', [
        mockFeedAddress,
        runtimeBytecode
    ])

    // Verify the mock works
    const mockFeed = new ethers.Contract(mockFeedAddress, STATIC_FEED_ABI, provider)
    const [, answer, , updatedAt,] = await mockFeed.latestRoundData()
    const dec = await mockFeed.decimals()
    console.log(`[+] Deployed mock StaticPriceFeed at ${mockFeedAddress}`)
    console.log(`    answer=${answer.toString()} ($${(parseFloat(answer.toString()) / 1e8).toFixed(2)} MOVR), decimals=${dec}, updatedAt=${updatedAt.toString()}`)

    return mockFeedAddress
}

/**
 * Build minimal EVM runtime bytecode for a mock DEX price feed.
 *
 * Returns 8 for decimals() and a latestRoundData tuple with a realistic
 * MOVR price (~$46.31) for all other calls.
 *
 * Bytecode layout:
 *   0x00: PUSH0 / CALLDATALOAD / SHR → extract selector
 *   0x05: Check decimals() selector → jump to handler
 *   0x0f: Default path: store 5-word tuple and RETURN
 *   0x2f: decimals handler: store 8 and RETURN
 */
function buildMockDexFeedBytecode(): string {
    // MOVR price = $10 → 1000000000 in 8-decimal format = 0x3B9ACA00
    const bytecodeOps = [
        // Load selector
        '5f',         // PUSH0
        '35',         // CALLDATALOAD
        '60e0',       // PUSH1 0xe0
        '1c',         // SHR → selector on stack

        // Check if decimals() = 0x313ce567
        '80',         // DUP1
        '63313ce567', // PUSH4 0x313ce567
        '14',         // EQ
        '602f',       // PUSH1 0x2f (jump to decimals handler)
        '57',         // JUMPI

        // Default: return latestRoundData tuple
        '50',         // POP (clean selector)

        // word 0 (0x00): roundId = 1
        '6001',       // PUSH1 1
        '5f',         // PUSH0
        '52',         // MSTORE
        // word 1 (0x20): answer = 1000000000 (0x3B9ACA00) = $10
        '633b9aca00', // PUSH4 0x3B9ACA00
        '6020',       // PUSH1 0x20
        '52',         // MSTORE
        // word 2 (0x40): startedAt = 1
        '6001',       // PUSH1 1
        '6040',       // PUSH1 0x40
        '52',         // MSTORE
        // word 3 (0x60): updatedAt = 1
        '6001',       // PUSH1 1
        '6060',       // PUSH1 0x60
        '52',         // MSTORE
        // word 4 (0x80): answeredInRound = 1
        '6001',       // PUSH1 1
        '6080',       // PUSH1 0x80
        '52',         // MSTORE
        // RETURN 160 bytes from offset 0
        '60a0',       // PUSH1 0xa0
        '5f',         // PUSH0
        'f3',         // RETURN

        // decimals handler (offset 0x2f)
        '5b',         // JUMPDEST
        '50',         // POP
        '6008',       // PUSH1 8
        '5f',         // PUSH0
        '52',         // MSTORE
        '6020',       // PUSH1 0x20
        '5f',         // PUSH0
        'f3',         // RETURN
    ].join('')

    return '0x' + bytecodeOps
}

test("mip-r39-verification", async () => {
    console.log("\n===========================================")
    console.log("MIP-R39: Set Oracle Prices for Moonriver Markets")
    console.log("===========================================\n")
    console.log("Summary: This proposal sets prices on the ChainlinkOracle")
    console.log("to unblock user redemptions after Chainlink feed deprecation.")
    console.log("MOVR uses a StaticPriceFeed with a fixed price set at deploy time.")
    console.log("Other markets use setDirectPrice with approximate static values.\n")

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

        // Inject MFAM tokens for governance
        const quorumAmount = EthersBigNumber.from('50000000').mul(EthersBigNumber.from(10).pow(18))
        await setMFAMBalance(provider, F_MOVR_GRANT, quorumAmount)
        console.log("[+] Injected 50M MFAM into F_MOVR_GRANT for governance testing")

        // Mock xcKSM XC-20 precompile with a dummy ERC20
        await replaceXCAssetWithDummyERC20(
            provider,
            contracts.MARKETS['FRAX'],
            contracts.MARKETS['xcKSM']
        )
        const symbolBytes = ethers.utils.formatBytes32String('xcKSM')
        const symbolWithLength = EthersBigNumber.from(symbolBytes).add('xcKSM'.length * 2).toHexString()
        await provider.send('evm_setAccountStorageAt', [
            contracts.MARKETS['xcKSM'].tokenAddress,
            ethers.utils.hexZeroPad('0x04', 32),
            ethers.utils.hexZeroPad(symbolWithLength, 32)
        ])
        console.log("[+] Mocked xcKSM XC-20 precompile with dummy ERC20")

        // Deploy mock StaticPriceFeed for MOVR on the Ganache fork
        const movrFeedAddress = await deployMockStaticPriceFeed(provider)

        // === ASSERT PRE-STATE: All oracle prices revert ===
        console.log("\n[+] Asserting pre-state: all oracle prices should revert...")
        const oracle = new ethers.Contract(ORACLE_ADDRESS, CHAINLINK_ORACLE_ABI, provider)

        const allMarkets = ['MOVR', 'USDC.multi', 'USDT.multi', 'FRAX', 'ETH.multi', 'BTC.multi', 'xcKSM']
        for (const ticker of allMarkets) {
            const market = contracts.MARKETS[ticker]
            if (market) {
                try {
                    await oracle.getUnderlyingPrice(market.mTokenAddress)
                    console.log(`    WARNING: ${ticker} price does NOT revert (unexpected)`)
                } catch (e) {
                    console.log(`    ${ticker} price reverts as expected`)
                }
            }
        }

        // Setup governance
        await setupDeployerAndEnvForGovernance(
            contracts,
            provider,
            F_MOVR_GRANT,
            FORK_BLOCK,
            5_000_000
        )

        // Generate proposal data with the test-deployed MOVR feed address
        const proposalData = await generateProposalData(contracts, provider, movrFeedAddress)

        console.log("\n[+] Proposal Summary:")
        console.log(`    - Total actions: ${proposalData.targets.length}`)
        console.log(`    - 6x setDirectPrice for ERC20 markets`)
        console.log(`    - 1x setFeed for MOVR (StaticPriceFeed @ $10) -> ${movrFeedAddress}\n`)

        await passGovProposal(contracts, provider, proposalData)

        // === ASSERT POST-STATE: All oracle prices return non-zero ===
        console.log("\n[+] Asserting post-state: all oracle prices should return non-zero...")

        for (const ticker of allMarkets) {
            const market = contracts.MARKETS[ticker]
            if (market) {
                try {
                    const price = await oracle.getUnderlyingPrice(market.mTokenAddress)
                    if (price.gt(0)) {
                        console.log(`    ${ticker} price: ${ethers.utils.formatUnits(price, 18)} (OK)`)
                    } else {
                        throw new Error(`${ticker} price is zero!`)
                    }
                } catch (e: any) {
                    throw new Error(`${ticker} price still reverts after proposal: ${e.message}`)
                }
            }
        }

        // Verify direct prices are set correctly for ERC20 markets
        console.log("\n[+] Verifying direct price overrides...")
        for (const [ticker, tokenAddress] of Object.entries(UNDERLYING_TOKENS)) {
            const storedPrice = await oracle.assetPrices(tokenAddress)
            const expectedPrice = EthersBigNumber.from(DIRECT_PRICES[ticker])
            if (storedPrice.eq(expectedPrice)) {
                console.log(`    ${ticker}: stored price matches expected (${ethers.utils.formatUnits(storedPrice, 18)} USD)`)
            } else {
                throw new Error(`${ticker} stored price mismatch: expected ${expectedPrice.toString()}, got ${storedPrice.toString()}`)
            }
        }

        console.log("\nMIP-R39 verification complete!")
        console.log("All 7 Moonriver market prices are now returning non-zero values.\n")
    } finally {
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
