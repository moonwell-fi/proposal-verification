import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {addMarketAdjustementsToProposal, addProposalToPropData} from "../../src";
import BigNumber from "bignumber.js";
import {ECOSYSTEM_RESERVE, ENDING_MARKET_REWARDS_STATE, F_MOVR_GRANT, SENDAMTS, SUBMITTER_WALLET} from "./vars";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const mantissa = EthersBigNumber.from(10).pow(18)

    const proposalData: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    console.log("[+] Constructing Proposal...")

    const mfamToken = contracts.GOV_TOKEN.contract.connect(provider)
    const stkMFAM = contracts.SAFETY_MODULE.contract.connect(provider)
    const comptroller = contracts.COMPTROLLER.contract.connect(provider)
    const dexRewarder = contracts.DEX_REWARDER.contract.connect(provider)

    // Send MFAM from F-MOVR-GRANT to ECOSYSTEM_RESERVE
    console.log(`    ✅ Sending ${SENDAMTS['ECOSYSTEM_RESERVE']} MFAM to the ECOSYSTEM_RESERVE`)
    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            F_MOVR_GRANT,
            ECOSYSTEM_RESERVE,
            EthersBigNumber.from(SENDAMTS['ECOSYSTEM_RESERVE']).mul(mantissa)
        ],
        proposalData
    )

    // Send MFAM from F-MOVR-GRANT to comptroller (unitroller)
    console.log(`    ✅ Sending ${SENDAMTS['COMPTROLLER']} MFAM to the COMPTROLLER`)
    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            F_MOVR_GRANT,
            contracts.COMPTROLLER.address,
            EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)
        ],
        proposalData
    )

    // Pull in MFAM to the timelock from F-MOVR-GRANT
    console.log(`    ✅ Sending ${SENDAMTS['DEX_REWARDER']} MFAM to the TIMELOCK`)
    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            F_MOVR_GRANT,
            contracts.TIMELOCK!.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Approve dexRewarder to pull MFAM from the timelock
    console.log(`    ✅ Approving ${SENDAMTS['DEX_REWARDER']} for the DEX REWARDER from the TIMELOCK`)
    await addProposalToPropData(mfamToken, 'approve',
        [
            contracts.DEX_REWARDER.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Configure dexRewarder/trigger pulling the WELL rewards
    console.log(`    ✅ Adding reward info to DEX REWARDER`)
    await addProposalToPropData(dexRewarder, 'addRewardInfo',
        [
            11,
            new Date("2023-01-27T03:30:00.000Z").getTime() / 1000, // == 1674790200
            EthersBigNumber.from(
                new BigNumber('5.284965330627430000').times(1e18).toFixed()
            )
        ],
        proposalData
    )

    // Configure new reward speeds for stkMFAM
    console.log(`    ✅ Adjust stkMFAM emissions`)
    await addProposalToPropData(stkMFAM, 'configureAsset',
        [
            EthersBigNumber.from(new BigNumber('2.536783358701170000').times(1e18).toFixed()),
            stkMFAM.address
        ],
        proposalData
    )

    await addMarketAdjustementsToProposal(
        contracts,
        comptroller,
        proposalData,
        ENDING_MARKET_REWARDS_STATE
    )

    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            F_MOVR_GRANT,
            SUBMITTER_WALLET,
            EthersBigNumber.from(SENDAMTS['SUBMITTER_WALLET']).mul(mantissa)
        ],
        proposalData
    )

    return proposalData
}