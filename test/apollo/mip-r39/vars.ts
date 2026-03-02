export * from '../base-vars'

// Fork block - using a recent Moonriver block
export const FORK_BLOCK = 9_800_000

// RPC URL - use environment variable or fallback to public RPC
export const RPC_URL = process.env.MOONRIVER_RPC_URL || 'https://rpc.api.moonriver.moonbeam.network'

// Oracle address on Moonriver (ChainlinkOracle)
export const ORACLE_ADDRESS = '0x892bE716Dcf0A6199677F355f45ba8CC123BAF60'

// Timelock (admin of oracle and comptroller)
export const TIMELOCK_ADDRESS = '0x04e6322D196E0E4cCBb2610dd8B8f2871E160bd7'

// Underlying token addresses
export const UNDERLYING_TOKENS: { [key: string]: string } = {
    'USDC.multi': '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',    // 6 decimals
    'USDT.multi': '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',    // 6 decimals
    'FRAX':       '0x1A93B23281CC1CDE4C4741353F3064709A16197d',    // 18 decimals
    'ETH.multi':  '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',    // 18 decimals
    'BTC.multi':  '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',    // 8 decimals
    'xcKSM':      '0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080',    // 12 decimals
}

// Prices in USD (scaled to 1e18 mantissa)
// These are approximate prices for wind-down purposes.
// Since all collateral factors are already 0, exact prices are not critical —
// they just need to be non-zero so getUnderlyingPrice() doesn't revert.
// NOTE: xcKSM and FRAX DEX pools are dead, so we use static prices for them.
export const DIRECT_PRICES: { [key: string]: string } = {
    'USDC.multi': '1000000000000000000',       // $1
    'USDT.multi': '1000000000000000000',       // $1
    'FRAX':       '1000000000000000000',       // $1
    'ETH.multi':  '2500000000000000000000',    // $2,500
    'BTC.multi':  '85000000000000000000000',   // $85,000
    'xcKSM':      '25000000000000000000',      // $25
}

// MOVR (native token) cannot use setDirectPrice because the ChainlinkOracle
// has a special code path for native tokens that bypasses the prices[] mapping.
// The oracle's nativeToken hash matches keccak256("mMOVR"), so getUnderlyingPrice(mMOVR)
// goes directly to getChainlinkPrice(getFeed("mMOVR")) without checking prices[].
//
// For MOVR, we call oracle.setFeed("mMOVR", staticFeedAddress) where
// staticFeedAddress is a pre-deployed StaticPriceFeed contract that returns
// a fixed MOVR price in Chainlink 8-decimal format.
//
// StaticPriceFeed contract: src/oracles/StaticPriceFeed.sol
// Deploy with: answer = 1000000000 ($10 in 8-decimal Chainlink format)
//
// TODO: Replace with actual deployed address before submitting proposal
export const MOVR_STATIC_FEED_ADDRESS = '0x0000000000000000000000000000000000000000' // REPLACE WITH DEPLOYED ADDRESS
