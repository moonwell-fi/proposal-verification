import {ethers} from "ethers";
import {
  assertChainlinkFeedIsNotRegistered,
  assertTokenMarketIsNotListed
} from "../../../src/verification/assertions";

import {ContractBundle} from "@moonwell-fi/moonwell.js";

// TODO: Refactor this somewhere global to use in a MIP.
async function assertExpectedStateForToken(
  provider: ethers.providers.JsonRpcProvider,
  contracts: ContractBundle,
  token: string,
  chainlinkFeedForToken: string
) {
  console.log(`[+] Asserting market for ${token} does not exist`)
  await assertTokenMarketIsNotListed(provider, contracts, token)
  await assertChainlinkFeedIsNotRegistered(provider, contracts, chainlinkFeedForToken)
}

export async function assertCurrentExpectedState(
  provider: ethers.providers.JsonRpcProvider, 
  contracts: ContractBundle, 
  tokensToList: Array<string>, 
  chainlinkFeedsForTokens: Array<string>
){
  for (let i = 0; i < tokensToList.length; i++) {
    await assertExpectedStateForToken(provider, contracts, tokensToList[i], chainlinkFeedsForTokens[i])
  }
}
