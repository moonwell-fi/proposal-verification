import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addProposalToPropData, ProposalData, REWARD_TYPES} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {MARKETS_TO_PAUSE, COLLATERAL_FACTOR_CHANGES} from "./vars";
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

    // Get the markets to pause emissions for
    const marketsToPause = Object.values(contracts.MARKETS).filter(
        m => MARKETS_TO_PAUSE.includes(m.assetTicker)
    )

    // For each market, set emissions with supply speed = 0, borrow speed = 1
    for (const market of marketsToPause){
        // GOVTOKEN (WELL) emissions - supply = 0, borrow = 1
        const govTokenTx = await comptroller.populateTransaction._setRewardSpeed(
            REWARD_TYPES.GOVTOKEN,
            market.mTokenAddress,
            0, // supply speed = 0
            1  // borrow speed = 1
        )
        proposalData.targets.push(comptroller.address)
        proposalData.values.push(0)
        proposalData.signatures.push(comptroller.interface.getFunction('_setRewardSpeed').format())
        proposalData.callDatas.push('0x' + govTokenTx.data!.slice(10))

        // NATIVE (MOVR) emissions - supply = 0, borrow = 1
        const nativeTx = await comptroller.populateTransaction._setRewardSpeed(
            REWARD_TYPES.NATIVE,
            market.mTokenAddress,
            0, // supply speed = 0
            1  // borrow speed = 1
        )
        proposalData.targets.push(comptroller.address)
        proposalData.values.push(0)
        proposalData.signatures.push(comptroller.interface.getFunction('_setRewardSpeed').format())
        proposalData.callDatas.push('0x' + nativeTx.data!.slice(10))
    }

    // Add collateral factor changes for each market (using direct access like other tests)
    // Processing one at a time to identify which market is causing issues
    const cfOrder = ['xcKSM', 'MOVR', 'FRAX'] // Fixed order
    const enableCFChanges = Object.keys(COLLATERAL_FACTOR_CHANGES).length > 0
    if (enableCFChanges) {
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
    }

    return proposalData
}
