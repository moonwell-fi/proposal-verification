import {ethers} from "ethers";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import BigNumber from "bignumber.js";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    const gov = contracts.GOVERNOR.contract.connect(provider)

    const currentUpperCap = new BigNumber((await gov.upperQuorumCap()).toString()).toFixed()
    const currentLowerCap = new BigNumber((await gov.lowerQuorumCap()).toString()).toFixed()

    const EXPECTED_UPPER_QUORUM_CAP = 900_000_000
    const EXPECTED_LOWER_QUORUM_CAP = 10_000_000

    if (currentUpperCap != new BigNumber(EXPECTED_UPPER_QUORUM_CAP).shiftedBy(18).toFixed()){
        throw new Error("Upper quorum cap is not as expected!")
    }

    if (currentLowerCap != new BigNumber(EXPECTED_LOWER_QUORUM_CAP).shiftedBy(18).toFixed()){
        throw new Error("Lower quorum cap is not as expected!")
    }
}
