import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addMarketAdjustementsToProposal, addProposalToPropData} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    F_GLMR_LM,
    SENDAMTS,
    SUBMITTER_WALLET,
} from "./vars";
import {ENDING_MARKET_REWARDS_STATE} from "./vars";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Generating Proposal Data")

    const mantissa = EthersBigNumber.from(10).pow(18)

    const proposalData: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    const wellToken = contracts.GOV_TOKEN.contract.connect(provider)
    const unitroller = contracts.COMPTROLLER.contract.connect(provider)

    await addMarketAdjustementsToProposal(
        contracts,
        unitroller,
        proposalData,
        ENDING_MARKET_REWARDS_STATE
    )

    // Send WELL to submitter
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            SUBMITTER_WALLET,
            EthersBigNumber.from(SENDAMTS['SUBMITTER_WALLET']).mul(mantissa)
        ],
        proposalData
    )

    return proposalData
}