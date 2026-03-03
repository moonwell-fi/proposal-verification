import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addProposalToPropData, ProposalData} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {COLLATERAL_FACTOR_CHANGES} from "./vars";
import BigNumber from "bignumber.js";

function cfPercentToMantissa(newCFPercent: number){
    return EthersBigNumber.from(
        new BigNumber(newCFPercent)
            .div(100)
            .times(new BigNumber('1e18'))
            .toFixed(0)
    )
}

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const comptroller = contracts.COMPTROLLER.contract.connect(provider)

    const proposalData: ProposalData = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    // Add collateral factor changes for each market
    const cfOrder = ['xcKSM', 'MOVR', 'FRAX'] // Fixed order
    for (const marketTicker of cfOrder) {
        const newCF = COLLATERAL_FACTOR_CHANGES[marketTicker]
        if (newCF !== undefined) {
            const market = contracts.MARKETS[marketTicker]
            if (market) {
                console.log(`    Adding CF change for ${marketTicker}: ${newCF}% (mToken: ${market.mTokenAddress})`)
                await addProposalToPropData(comptroller, '_setCollateralFactor',
                    [
                        market.mTokenAddress,
                        cfPercentToMantissa(newCF)
                    ],
                    proposalData
                )
            }
        }
    }

    return proposalData
}
