import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addMarketAdjustementsToProposal, addProposalToPropData} from "../../../src";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE,
    ENDING_MARKET_REWARDS_STATE,
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
    const unitroller = contracts.COMPTROLLER.contract.connect(provider)
    const dexRewarder = contracts.DEX_REWARDER.contract.connect(provider)

    // Send WELL from F-GLMR-LM to ecosystemReserve
    console.log(`    📝 Adding transferFrom call from ${F_GLMR_LM} (F_GLMR_LM) to ${ECOSYSTEM_RESERVE} (ECOSYSTEM_RESERVE) for ${EthersBigNumber.from(SENDAMTS["ECOSYSTEM_RESERVE"]).mul(mantissa)} WELL`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            ECOSYSTEM_RESERVE,
            EthersBigNumber.from(SENDAMTS["ECOSYSTEM_RESERVE"]).mul(mantissa)
        ],
        proposalData
    )

    // Send WELL from F-GLMR-LM to unitroller
    console.log(`    📝 Adding transferFrom call from ${F_GLMR_LM} (F_GLMR_LM) to ${contracts.COMPTROLLER.address} (COMPTROLLER) for ${EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)} WELL`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.COMPTROLLER.address,
            EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)
        ],
        proposalData
    )

    // Pull in WELL to the timelock from F-GLMR-LM
    console.log(`    📝 Adding transferFrom call from ${F_GLMR_LM} (F-GLMR-LM) to ${contracts.TIMELOCK} (TIMELOCK) for ${EthersBigNumber.from(SENDAMTS["DEX_REWARDER"]).mul(mantissa)} WELL`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.TIMELOCK!.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Approve dexRewarder to pull WELL from the timelock
    console.log(`    📝 Adding approval call for ${contracts.DEX_REWARDER.address} (DEX_REWARDER) to pull WELL from the Timelock`)
    await addProposalToPropData(wellToken, 'approve',
        [
            contracts.DEX_REWARDER.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Configure dexRewarder/trigger pulling the WELL rewards
    console.log(`    📝 Adding addRewardInfo call to ${contracts.DEX_REWARDER.address} (DEX_REWARDER)`)
    await addProposalToPropData(dexRewarder, 'addRewardInfo',
        [
            15,
            new Date("2022-12-02T03:30:00.000Z").getTime() / 1000, // == 1669951800
            EthersBigNumber.from(
                new BigNumber('2.086672008547010000').times(1e18).toFixed()
            )
        ],
        proposalData
    )

    // Configure new reward speeds for stkWELL
    console.log(`    📝 Adding configureAsset call to ${contracts.SAFETY_MODULE.address} (SAFETY_MODULE)`)
    await addProposalToPropData(stkWELL, 'configureAsset',
        [
            EthersBigNumber.from(new BigNumber('2.086672008547010000').times(1e18).toFixed()),
            stkWELL.address
        ],
        proposalData
    )

    await addMarketAdjustementsToProposal(
        contracts,
        unitroller,
        proposalData,
        ENDING_MARKET_REWARDS_STATE
    )

    // Send WELL to submitter
    console.log(`    📝 Adding transferFrom call to send WELL to ${SUBMITTER_WALLET} (SUBMITTER_WALLET)`)
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