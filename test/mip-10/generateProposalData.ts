import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addProposalToPropData} from "../../src";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE,
    F_GLMR_LM,
    SENDAMTS,
    SUBMITTER_WALLET,
} from "./vars";

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
    const stkWELL = contracts.SAFETY_MODULE.contract.connect(provider)
    const dexRewarder = contracts.DEX_REWARDER.contract.connect(provider)

    // Send WELL from F-GLMR-LM to ecosystemReserve
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            ECOSYSTEM_RESERVE,
            EthersBigNumber.from(SENDAMTS["ECOSYSTEM_RESERVE"]).mul(mantissa)
        ],
        proposalData
    )

    // Send WELL from F-GLMR-LM to unitroller
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.COMPTROLLER.address,
            EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)
        ],
        proposalData
    )

    // Pull in WELL to the timelock from F-GLMR-LM
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.TIMELOCK!.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Approve dexRewarder to pull WELL from the timelock
    await addProposalToPropData(wellToken, 'approve',
        [
            contracts.DEX_REWARDER.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Configure dexRewarder/trigger pulling the WELL rewards
    await addProposalToPropData(dexRewarder, 'addRewardInfo',
        [
            15,
            new Date("2023-01-27T03:30:00.000Z").getTime() / 1000, // == 1674790200
            EthersBigNumber.from(
                new BigNumber('1.878004807692310000').times(1e18).toFixed()
            )
        ],
        proposalData
    )

    // Configure new reward speeds for stkWELL
    await addProposalToPropData(stkWELL, 'configureAsset',
        [
            EthersBigNumber.from(new BigNumber('2.295339209401710000').times(1e18).toFixed()),
            stkWELL.address
        ],
        proposalData
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