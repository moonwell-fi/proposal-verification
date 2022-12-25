import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addMarketAdjustementsToProposal, addProposalToPropData} from "../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";


export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Generating Proposal Data")

    // TODO: Gauntlet data goes here
    const proposalData = {
        targets: [],
        values: [], 
        signatures: [],
        callDatas: [],
    }

    return proposalData
}