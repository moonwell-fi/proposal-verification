import {ethers} from "ethers";
import {
  assertChainlinkFeedIsNotRegistered,
  assertMarketIsNotListed
} from "../../src/verification/assertions";

import {ContractBundle} from "@moonwell-fi/moonwell.js";

export async function assertCurrentExpectedState(
  provider: ethers.providers.JsonRpcProvider, 
  contracts: ContractBundle, 
  tokenToList: string, 
  chainlinkFeedForToken: string
){
    console.log("[+] Asserting market does not exist")
    await assertMarketIsNotListed(provider, contracts, tokenToList)
    await assertChainlinkFeedIsNotRegistered(provider, contracts, chainlinkFeedForToken)
}