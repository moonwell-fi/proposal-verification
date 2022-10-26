import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addProposalToPropData} from "../../src";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    DEX_REWARDER,
    ECOSYSTEM_RESERVE,
    fGLMRDEVGRANT,
    fGLMRLM,
    SENDAMTS,
    STKWELL,
    WALLET_PAYMENT_AMOUNT,
    WALLET_TO_PAY
} from "./vars";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const mantissa = EthersBigNumber.from(10).pow(18)

    const proposalData: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    const wellToken = new ethers.Contract(
        contracts.GOV_TOKEN,
        require('../../src/abi/Well.json').abi,
        provider
    )
    const dexRewarder = new ethers.Contract(
        DEX_REWARDER,
        require('../../src/abi/dexRewarder.json').abi,
        provider
    )
    const stkWELL = new ethers.Contract(
        STKWELL,
        require('../../src/abi/StakedWell.json').abi,
        provider
    )
    const unitroller = new ethers.Contract(
        contracts.COMPTROLLER,
        require('../../src/abi/Comptroller.json').abi,
        provider
    )

    // Send 4_182_693 WELL from F-GLMR-LM to ecosystemReserve
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            fGLMRLM,
            ECOSYSTEM_RESERVE,
            EthersBigNumber.from(SENDAMTS["EcosystemReserve"]).mul(mantissa)
        ],
        proposalData
    )

    // Send 4,759,616 WELL from F-GLMR-LM to unitroller
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            fGLMRLM,
            contracts.COMPTROLLER,
            EthersBigNumber.from(SENDAMTS["Unitroller"]).mul(mantissa)
        ],
        proposalData
    )

    // Pull in 5,480,770 WELL to the timelock from F-GLMR-LM
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            fGLMRLM,
            contracts.TIMELOCK,
            EthersBigNumber.from(SENDAMTS['Dex Rewarder']).mul(mantissa)
        ],
        proposalData
    )

    // Approve dexRewarder to pull 5,480,770 WELL from the timelock
    await addProposalToPropData(wellToken, 'approve',
        [
            DEX_REWARDER,
            EthersBigNumber.from(SENDAMTS['Dex Rewarder']).mul(mantissa)
        ],
        proposalData
    )

    // Configure dexRewarder/trigger pulling the WELL rewards
    await addProposalToPropData(dexRewarder, 'addRewardInfo',
        [
            15,
            new Date("2022-11-04T03:30:00.000Z").getTime() / 1000, // == 1667532600
            EthersBigNumber.from(
                new BigNumber('2.26552960927961').times(1e18).toFixed()
            )
        ],
        proposalData
    )

    // Configure new reward speeds for stkWELL
    await addProposalToPropData(stkWELL, 'configureAsset',
        [
            EthersBigNumber.from(new BigNumber('1.72895680708181').times(1e18).toFixed()),
            stkWELL.address
        ],
        proposalData
    )

    // Configure WELL reward speed for GLMR
    await addProposalToPropData(unitroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = WELL, 1 = GLMR
            contracts.MARKETS['GLMR'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.649253090659341').times(1e18).toFixed()),
            EthersBigNumber.from(1), // 1wei borrow speed
        ],
        proposalData
    )
    // Configure WELL reward speed for xcDOT
    await addProposalToPropData(unitroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = WELL, 1 = GLMR
            contracts.MARKETS['xcDOT'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.668927426739927').times(1e18).toFixed()),
            EthersBigNumber.from(1), // 1wei borrow speed
        ],
        proposalData
    )
    // Configure WELL reward speed for FRAX
    await addProposalToPropData(unitroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = WELL, 1 = GLMR
            contracts.MARKETS['FRAX'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.649253090659341').times(1e18).toFixed()),
            EthersBigNumber.from(1), // 1wei borrow speed
        ],
        proposalData
    )

    // Send from F-GLMR-DEVGRANT to delegate
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            fGLMRDEVGRANT,
            WALLET_TO_PAY,
            EthersBigNumber.from(WALLET_PAYMENT_AMOUNT).mul(mantissa)
        ],
        proposalData
    )

    return proposalData
}