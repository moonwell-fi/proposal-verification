import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {ProposalData} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {ORACLE_ADDRESS, UNDERLYING_TOKENS, DIRECT_PRICES, MOVR_STATIC_FEED_ADDRESS} from "./vars";

// ChainlinkOracle ABI (only the functions we need)
const CHAINLINK_ORACLE_ABI = [
    'function setDirectPrice(address asset, uint256 price) external',
    'function setFeed(string calldata symbol, address feed) external',
    'function admin() view returns (address)',
];

/**
 * Generate proposal data for MIP-R39.
 *
 * @param _contracts - Moonwell contract bundle (unused but kept for interface consistency)
 * @param provider - JSON-RPC provider
 * @param movrFeedOverride - Optional override for the MOVR DEX feed address (used in tests)
 */
export async function generateProposalData(
    _contracts: ContractBundle,
    provider: ethers.providers.JsonRpcProvider,
    movrFeedOverride?: string
){
    const oracle = new ethers.Contract(ORACLE_ADDRESS, CHAINLINK_ORACLE_ABI, provider)
    const movrFeedAddress = movrFeedOverride || MOVR_STATIC_FEED_ADDRESS

    const proposalData: ProposalData = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    // Set direct prices for all ERC20 markets (no viable DEX pairs for these)
    const marketOrder = ['USDC.multi', 'USDT.multi', 'FRAX', 'ETH.multi', 'BTC.multi', 'xcKSM']

    for (const ticker of marketOrder) {
        const underlyingAddress = UNDERLYING_TOKENS[ticker]
        const price = EthersBigNumber.from(DIRECT_PRICES[ticker])

        console.log(`    Adding setDirectPrice for ${ticker}: ${underlyingAddress} @ ${ethers.utils.formatUnits(price, 18)} USD`)

        const tx = await oracle.populateTransaction.setDirectPrice(underlyingAddress, price)

        proposalData.targets.push(ORACLE_ADDRESS)
        proposalData.values.push(0)
        proposalData.signatures.push('setDirectPrice(address,uint256)')
        proposalData.callDatas.push('0x' + tx.data!.slice(10))
    }

    // MOVR: native token uses a different code path in ChainlinkOracle.
    // getUnderlyingPrice(mMOVR) matches the nativeToken hash and calls
    // getChainlinkPrice(getFeed("mMOVR")) directly, bypassing prices[].
    // We use setFeed to point "mMOVR" to a pre-deployed StaticPriceFeed contract.
    console.log(`    Adding setFeed for mMOVR: ${movrFeedAddress} (StaticPriceFeed)`)
    const feedTx = await oracle.populateTransaction.setFeed("mMOVR", movrFeedAddress)
    proposalData.targets.push(ORACLE_ADDRESS)
    proposalData.values.push(0)
    proposalData.signatures.push('setFeed(string,address)')
    proposalData.callDatas.push('0x' + feedTx.data!.slice(10))

    return proposalData
}
