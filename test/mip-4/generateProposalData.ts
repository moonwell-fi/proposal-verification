import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addProposalToPropData} from "../../src";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";

function cfPercentToMantissa(newCFPercent){
    return EthersBigNumber.from(
        new BigNumber(newCFPercent)
            .div(100)
            .times(new BigNumber('1e18'))
            .toFixed(0)
    )
}

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const proposalData: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    const unitroller = new ethers.Contract(
        contracts.COMPTROLLER,
        require('../../src/abi/Comptroller.json').abi,
        provider
    )

    await addProposalToPropData(unitroller, '_setCollateralFactor',
        [
            contracts.MARKETS['ETH.multi'].mTokenAddress,
            cfPercentToMantissa(62)
        ],
        proposalData
    )

    await addProposalToPropData(unitroller, '_setCollateralFactor',
        [
            contracts.MARKETS['USDT.multi'].mTokenAddress,
            cfPercentToMantissa(42)
        ],
        proposalData
    )

    await addProposalToPropData(unitroller, '_setCollateralFactor',
        [
            contracts.MARKETS['FRAX'].mTokenAddress,
            cfPercentToMantissa(59.5)
        ],
        proposalData
    )

    return proposalData
}