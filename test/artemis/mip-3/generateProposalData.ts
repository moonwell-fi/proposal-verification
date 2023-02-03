import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addProposalToPropData} from "../../../src";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const proposalData: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    const comptroller = contracts.COMPTROLLER.contract.connect(provider)

    // Configure WELL reward speed for GLMR
    const newCFPercent = 62
    const newCFBigNumber = EthersBigNumber.from(
        new BigNumber(newCFPercent)
            .div(100)
            .times(new BigNumber('1e18'))
            .toFixed(0)
    )

    await addProposalToPropData(comptroller, '_setCollateralFactor',
        [
            contracts.MARKETS['xcDOT'].mTokenAddress,
            newCFBigNumber
        ],
        proposalData
    )

    return proposalData
}