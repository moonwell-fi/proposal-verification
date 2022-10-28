import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {addMarketAdjustementsToProposal, addProposalToPropData} from "../../src";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    DEX_REWARDER,
    ECOSYSTEM_RESERVE, ENDING_MARKET_REWARDS_STATE, F_GLMR_LM,
    SENDAMTS, SUBMITTER_WALLET,
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
        contracts.SAFETY_MODULE,
        require('../../src/abi/StakedWell.json').abi,
        provider
    )
    const unitroller = new ethers.Contract(
        contracts.COMPTROLLER,
        require('../../src/abi/Comptroller.json').abi,
        provider
    )

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
    console.log(`    📝 Adding transferFrom call from ${F_GLMR_LM} (F_GLMR_LM) to ${contracts.COMPTROLLER} (COMPTROLLER) for ${EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)} WELL`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.COMPTROLLER,
            EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)
        ],
        proposalData
    )

    // Pull in WELL to the timelock from F-GLMR-LM
    console.log(`    📝 Adding transferFrom call from ${F_GLMR_LM} (F-GLMR-LM) to ${contracts.TIMELOCK} (TIMELOCK) for ${EthersBigNumber.from(SENDAMTS["DEX_REWARDER"]).mul(mantissa)} WELL`)
    await addProposalToPropData(wellToken, 'transferFrom',
        [
            F_GLMR_LM,
            contracts.TIMELOCK,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Approve dexRewarder to pull WELL from the timelock
    console.log(`    📝 Adding approval call for ${DEX_REWARDER} (DEX_REWARDER) to pull WELL from the Timelock`)
    await addProposalToPropData(wellToken, 'approve',
        [
            DEX_REWARDER,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Configure dexRewarder/trigger pulling the WELL rewards
    console.log(`    📝 Adding addRewardInfo call to ${DEX_REWARDER} (DEX_REWARDER)`)
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
    console.log(`    📝 Adding configureAsset call to ${contracts.SAFETY_MODULE} (SAFETY_MODULE)`)
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