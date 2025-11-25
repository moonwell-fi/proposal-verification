import {ethers} from "ethers";
import {assertMarketRewardState} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {ENDING_MARKET_REWARDS_STATE} from "./vars";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting emission rates are in expected state AFTER gov proposal passed")

    // Assert that the markets have updated emissions after the proposal
    await assertMarketRewardState(contracts, provider, ENDING_MARKET_REWARDS_STATE)

    console.log("[+] ✅ All emission rates are in expected state after proposal")
}
