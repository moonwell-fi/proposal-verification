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
import {F_MOVR_GRANT, FORK_BLOCK, RPC_URL, ORACLE_ADDRESS, UNDERLYING_TOKENS, DIRECT_PRICES, MOVR_STATIC_FEED_ADDRESS} from "./vars";

const CHAINLINK_ORACLE_ABI = [
    'function getUnderlyingPrice(address mToken) view returns (uint256)',
    'function assetPrices(address asset) view returns (uint256)',
    'function admin() view returns (address)',
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

test("mip-r39-verification", async () => {
    console.log("\n===========================================")
    console.log("MIP-R39: Restore Withdrawals on Moonriver by Setting Oracle Prices")
    console.log("===========================================\n")
    console.log("Summary: This proposal sets prices on the ChainlinkOracle")
    console.log("to unblock user redemptions after Chainlink feed deprecation.")
    console.log("MOVR uses a StaticPriceFeed at", MOVR_STATIC_FEED_ADDRESS)
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

        // Verify the deployed StaticPriceFeed is accessible on the fork
        const staticFeed = new ethers.Contract(MOVR_STATIC_FEED_ADDRESS, [
            'function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)',
            'function decimals() view returns (uint8)',
        ], provider)
        const [, answer, , updatedAt,] = await staticFeed.latestRoundData()
        const dec = await staticFeed.decimals()
        console.log(`[+] StaticPriceFeed at ${MOVR_STATIC_FEED_ADDRESS}`)
        console.log(`    answer=${answer.toString()} ($${(parseFloat(answer.toString()) / 1e8).toFixed(2)} MOVR), decimals=${dec}`)

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

        // Generate and pass proposal (uses the real deployed StaticPriceFeed address)
        const proposalData = await generateProposalData(contracts, provider)

        console.log("\n[+] Proposal Summary:")
        console.log(`    - Total actions: ${proposalData.targets.length}`)
        console.log(`    - 6x setDirectPrice for ERC20 markets`)
        console.log(`    - 1x setFeed for MOVR (StaticPriceFeed @ $1.25) -> ${MOVR_STATIC_FEED_ADDRESS}\n`)

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
