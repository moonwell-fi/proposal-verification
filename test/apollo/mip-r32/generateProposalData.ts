import {ethers} from "ethers";
import {ProposalData} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {MARKETS_TO_PAUSE} from "./vars";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const comptroller = contracts.COMPTROLLER.contract.connect(provider)

    const proposalData: ProposalData = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    // Get the markets to pause
    const marketsToPause = Object.values(contracts.MARKETS).filter(
        m => MARKETS_TO_PAUSE.includes(m.assetTicker)
    )

    // Pause minting (supplying) for each market
    for (const market of marketsToPause){
        const tx = await comptroller.populateTransaction._setMintPaused(
            market.mTokenAddress,
            true // true = pause
        )
        proposalData.targets.push(comptroller.address)
        proposalData.values.push(0)
        proposalData.signatures.push(comptroller.interface.getFunction('_setMintPaused').format())
        proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args
    }

    // Pause borrowing for each market
    for (const market of marketsToPause){
        const tx = await comptroller.populateTransaction._setBorrowPaused(
            market.mTokenAddress,
            true // true = pause
        )
        proposalData.targets.push(comptroller.address)
        proposalData.values.push(0)
        proposalData.signatures.push(comptroller.interface.getFunction('_setBorrowPaused').format())
        proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args
    }

    return proposalData
}
