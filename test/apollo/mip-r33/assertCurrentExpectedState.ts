import {ethers} from "ethers";
import {assertMarketRewardState} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {STARTING_MARKET_REWARDS_STATE} from "./vars";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting emission rates are in expected state BEFORE gov proposal passes")

    // Assert that the markets have active emissions before the proposal
    await assertMarketRewardState(contracts, provider, STARTING_MARKET_REWARDS_STATE)

    console.log("[+] ✅ All emission rates are in expected state before proposal")
}
