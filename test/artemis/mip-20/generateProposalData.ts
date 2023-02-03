import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addMarketAdjustementsToProposal, addProposalToPropData} from "../../../src";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    EXTRA_MARKET_ADDRESSES,
    F_GLMR_LM,
    SENDAMTS,
    SUBMITTER_WALLET,
} from "./vars";
import {ENDING_MARKET_REWARDS_STATE, ECOSYSTEM_RESERVE} from "./vars";
import BigNumber from "bignumber.js";

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
    const unitroller = contracts.COMPTROLLER.contract.connect(provider)
    const stkWELL = contracts.SAFETY_MODULE.contract.connect(provider)
    const dexRewarder = contracts.DEX_REWARDER.contract.connect(provider)

    // Send WELL from F-GLMR-LM to ecosystemReserve
    console.log(`    📝 Sending ${SENDAMTS['ECOSYSTEM_RESERVE'].toLocaleString()} WELL to the ECOSYSTEM_RESERVE`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            ECOSYSTEM_RESERVE,
            EthersBigNumber.from(SENDAMTS["ECOSYSTEM_RESERVE"]).mul(mantissa)
        ],
        proposalData
    )

    // Send WELL from F-GLMR-LM to unitroller
    console.log(`    📝 Sending ${SENDAMTS['COMPTROLLER'].toLocaleString()} WELL to the COMPTROLLER`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.COMPTROLLER.address,
            EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)
        ],
        proposalData
    )

    // Pull in WELL to the timelock from F-GLMR-LM
    console.log(`    📝 Sending ${SENDAMTS['DEX_REWARDER'].toLocaleString()} WELL to the DEX_REWARDER`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.TIMELOCK!.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Approve dexRewarder to pull WELL from the timelock
    console.log(`    📝 Approving ${SENDAMTS['DEX_REWARDER'].toLocaleString()} WELL to be pulled by DEX_REWARDER`)
    await addProposalToPropData(wellToken, 'approve',
        [
            contracts.DEX_REWARDER.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Configure dexRewarder/trigger pulling the WELL rewards
    console.log(`    📝 Calling addRewardInfo on DEX_REWARDER`)
    await addProposalToPropData(dexRewarder, 'addRewardInfo',
        [
            15,
            new Date("2023-02-24T03:30:00.000Z").getTime() / 1000, // == 1677209400
            EthersBigNumber.from(
                new BigNumber('1.669337606837610000').times(1e18).toFixed()
            )
        ],
        proposalData
    )

    // Configure new reward speeds for stkWELL
    console.log(`    📝 Calling configureAsset on SATEY_MODULE`)
    await addProposalToPropData(stkWELL, 'configureAsset',
        [
            EthersBigNumber.from(new BigNumber('2.504006410256410000').times(1e18).toFixed()),
            stkWELL.address
        ],
        proposalData
    )

    // Send WELL to submitter
    console.log(`    📝 Sending ${SENDAMTS['SUBMITTER_WALLET'].toLocaleString()} WELL to the SUBMITTER_WALLET`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            SUBMITTER_WALLET,
            EthersBigNumber.from(SENDAMTS['SUBMITTER_WALLET']).mul(mantissa)
        ],
        proposalData
    )

    await addMarketAdjustementsToProposal(
        contracts,
        unitroller,
        proposalData,
        ENDING_MARKET_REWARDS_STATE,
        EXTRA_MARKET_ADDRESSES
    )

    return proposalData
}