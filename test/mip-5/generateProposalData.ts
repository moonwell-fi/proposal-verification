import {ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "@ethersproject/bignumber/lib/bignumber";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {addProposalToPropData} from "../../src";
import BigNumber from "bignumber.js";
import {ECOSYSTEM_RESERVE, fMOVRGrant, SENDAMTS, SUBMITTER_WALLET} from "./vars";

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
    const stkWELL = contracts.SAFETY_MODULE.contract.connect(provider)
    const comptroller = contracts.COMPTROLLER.contract.connect(provider)
    const dexRewarder = contracts.DEX_REWARDER.contract.connect(provider)

    // Send MFAM from F-MOVR-GRANT to ECOSYSTEM_RESERVE
    console.log(`    ✅ Sending ${SENDAMTS['ECOSYSTEM_RESERVE']} MFAM to the ECOSYSTEM_RESERVE`)
    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            fMOVRGrant,
            ECOSYSTEM_RESERVE,
            EthersBigNumber.from(SENDAMTS['ECOSYSTEM_RESERVE']).mul(mantissa)
        ],
        proposalData
    )

    // Send MFAM from F-MOVR-GRANT to comptroller (unitroller)
    console.log(`    ✅ Sending ${SENDAMTS['COMPTROLLER']} MFAM to the COMPTROLLER`)
    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            fMOVRGrant,
            contracts.COMPTROLLER.address,
            EthersBigNumber.from(SENDAMTS["COMPTROLLER"]).mul(mantissa)
        ],
        proposalData
    )

    // Pull in MFAM to the timelock from F-MOVR-GRANT
    console.log(`    ✅ Sending ${SENDAMTS['DEX_REWARDER']} MFAM to the DEX_REWARDER`)
    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            fMOVRGrant,
            contracts.TIMELOCK!.address,
            EthersBigNumber.from(SENDAMTS['DEX_REWARDER']).mul(mantissa)
        ],
        proposalData
    )

    // Approve dexRewarder to pull 5,480,770 WELL from the timelock
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
            new Date("2022-12-02T03:30:00.000Z").getTime() / 1000, // == 1669951800
            EthersBigNumber.from(
                new BigNumber('5.198326554715510000').times(1e18).toFixed()
            )
        ],
        proposalData
    )

    // Configure new reward speeds for stkWELL
    console.log(`    ✅ Adjust stkWELL emissions`)
    await addProposalToPropData(stkWELL, 'configureAsset',
        [
            EthersBigNumber.from(new BigNumber('1.559497966414650000').times(1e18).toFixed()),
            stkWELL.address
        ],
        proposalData
    )

    // Configure reward speeds for MOVR
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['MOVR'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.12789351851851900').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.30092592592592600').times(1e18).toFixed()),
        ],
        proposalData
    )
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(1), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['MOVR'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.000384041666666667').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.000896097222222222').times(1e18).toFixed()),
        ],
        proposalData
    )

    // Configure reward speeds for xcKSM
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['xcKSM'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.13194444444444400').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.13194444444444400').times(1e18).toFixed()),
        ],
        proposalData
    )
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(1), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['xcKSM'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.000393888888888889').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.000393888888888889').times(1e18).toFixed()),
        ],
        proposalData
    )

    // Configure reward speeds for ETH.multi
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['ETH.multi'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.137731481481481000').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.324074074074074000').times(1e18).toFixed()),
        ],
        proposalData
    )
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(1), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['ETH.multi'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.000413583333333333').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.000965027777777778').times(1e18).toFixed()),
        ],
        proposalData
    )

    // Configure reward speeds for USDC.multi
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['USDC.multi'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.344328703703704000').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.810185185185185000').times(1e18).toFixed()),
        ],
        proposalData
    )
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(1), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['USDC.multi'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.001033958333333330').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.002412569444444440').times(1e18).toFixed()),
        ],
        proposalData
    )

    // Configure reward speeds for USDT.multi
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['USDT.multi'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.098379629629629600').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.231481481481481000').times(1e18).toFixed()),
        ],
        proposalData
    )
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(1), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['USDT.multi'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.000295416666666667').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.000689305555555556').times(1e18).toFixed()),
        ],
        proposalData
    )

    // Configure reward speeds for FRAX
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(0), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['FRAX'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.196759259259259000').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.462962962962963000').times(1e18).toFixed()),
        ],
        proposalData
    )
    await addProposalToPropData(comptroller, '_setRewardSpeed',
        [
            EthersBigNumber.from(1), // 0 = MFAM, 1 = MOVR
            contracts.MARKETS['FRAX'].mTokenAddress,
            EthersBigNumber.from(new BigNumber('0.000590833333333333').times(1e18).toFixed()),
            EthersBigNumber.from(new BigNumber('0.001378611111111110').times(1e18).toFixed()),
        ],
        proposalData
    )

    await addProposalToPropData(mfamToken, 'transferFrom',
        [
            fMOVRGrant,
            SUBMITTER_WALLET,
            EthersBigNumber.from(SENDAMTS['SUBMITTER_WALLET']).mul(mantissa)
        ],
        proposalData
    )


    return proposalData
}