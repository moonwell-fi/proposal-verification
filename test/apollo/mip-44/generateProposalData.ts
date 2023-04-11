import {ethers} from "ethers";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {addProposalToPropData} from "../../../src";
import BigNumber from "bignumber.js";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const proposalData: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    console.log("[+] Constructing Proposal...")

    const NEW_UPPER_CAP = new BigNumber(45_000_001).shiftedBy(18)
    const NEW_LOWER_CAP = new BigNumber(45_000_000).shiftedBy(18)

    const governor = contracts.GOVERNOR.contract.connect(provider)

    console.log(`    ✅ Setting quorum caps to ${NEW_LOWER_CAP.shiftedBy(-18).toFixed()} (lower) / ${NEW_UPPER_CAP.shiftedBy(-18).toFixed()} (upper)`)
    // function setQuorumCaps(uint newLowerQuorumCap, uint newUpperQuorumCap) external
    await addProposalToPropData(governor, 'setQuorumCaps',
        [
            NEW_LOWER_CAP.toFixed(),
            NEW_UPPER_CAP.toFixed(),
        ],
        proposalData
    )

    return proposalData
}