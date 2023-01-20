import {ethers} from "ethers";

import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    SENDAMTS,
} from "./vars";
import {SUBMITTER_WALLET} from "./vars";
import {
    assertMarketRewardState,
} from "../../../src";
import {assertRoundedWellBalance} from "../../../src/verification/assertions";
import {ENDING_MARKET_REWARDS_STATE} from "./vars";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    await assertRoundedWellBalance(contracts, provider,
        SUBMITTER_WALLET,
        'SUBMITTER_WALLET',
        SENDAMTS['SUBMITTER_WALLET']
    )

    await assertMarketRewardState(
        contracts, provider, ENDING_MARKET_REWARDS_STATE
    )

}