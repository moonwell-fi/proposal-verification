import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {ContractBundle, ProposalData} from "@moonwell-fi/moonwell.js";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const unitroller = new ethers.Contract(
        contracts.COMPTROLLER,
        require('../../src/abi/Comptroller.json').abi,
        provider
    )

    const proposalData: ProposalData = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    const nomadMarkets = Object.values(contracts.MARKETS).filter(
        m => ['ETH', 'BTC', 'USDC'].includes(m.assetTicker)
    )

    const functionalMarkets = Object.values(contracts.MARKETS).filter(
        m => ['FRAX', 'GLMR', 'xcDOT'].includes(m.assetTicker)
    )

    // Set collateral factors to 0 for the nomad markets
    for (const market of nomadMarkets){
        const tx = await unitroller.populateTransaction._setCollateralFactor(
            market.mTokenAddress,
            EthersBigNumber.from(0)
        )
        proposalData.targets.push(unitroller.address)
        proposalData.values.push(0)
        proposalData.signatures.push(unitroller.interface.getFunction('_setCollateralFactor').format())
        proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args
    }

    // Set RF=100% for the nomad markets
    for (const market of nomadMarkets){
        const mToken = new ethers.Contract(
            market.mTokenAddress,
            require('../../src/abi/MToken.json').abi,
            provider
        )

        // 100% == 1e18
        const tx = await mToken.populateTransaction._setReserveFactor(
            EthersBigNumber.from(10).pow(18).mul(1)
        )
        proposalData.targets.push(market.mTokenAddress)
        proposalData.values.push(0)
        proposalData.signatures.push(mToken.interface.getFunction('_setReserveFactor').format())
        proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args
    }

    // Set Borrow paused = false for functional markets
    for (const market of functionalMarkets){
        const tx = await unitroller.populateTransaction._setBorrowPaused(
            market.mTokenAddress,
            false
        )
        proposalData.targets.push(unitroller.address)
        proposalData.values.push(0)
        proposalData.signatures.push(unitroller.interface.getFunction('_setBorrowPaused').format())
        proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args
    }

    // Set mToken transfers re-enabled
    const tx = await unitroller.populateTransaction._setTransferPaused(false)
    proposalData.targets.push(unitroller.address)
    proposalData.values.push(0)
    proposalData.signatures.push(unitroller.interface.getFunction('_setTransferPaused').format())
    proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args

    return proposalData
}
