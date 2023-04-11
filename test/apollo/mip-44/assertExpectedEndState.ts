import {ethers} from "ethers";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    F_MOVR_GRANT
} from "./vars";
import {
    addProposalToPropData,
    assertEndingExpectedGovTokenHoldings,
    assertMarketRewardState, passGovProposal
} from "../../../src";
import {assertDexRewarderRewardsPerSec, assertSTKWellEmissionsPerSecond} from "../../../src/verification/assertions";
import BigNumber from "bignumber.js";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    const gov = contracts.GOVERNOR.contract.connect(provider)

    const currentUpperCap = new BigNumber((await gov.upperQuorumCap()).toString()).toFixed()
    const currentLowerCap = new BigNumber((await gov.lowerQuorumCap()).toString()).toFixed()

    const EXPECTED_UPPER_QUORUM_CAP = 45_000_001
    const EXPECTED_LOWER_QUORUM_CAP = 45_000_000

    if (currentUpperCap != new BigNumber(EXPECTED_UPPER_QUORUM_CAP).shiftedBy(18).toFixed()){
        throw new Error("Upper quorum cap is not as expected!")
    }

    if (currentLowerCap != new BigNumber(EXPECTED_LOWER_QUORUM_CAP).shiftedBy(18).toFixed()){
        throw new Error("Lower quorum cap is not as expected!")
    }


    /*
        Go make sure that by adjusting the deployer holdings to QUORUM_CAP_UPPER + 1 we can
        still pass proposals
    */

    console.log("\n=== Attempting to pass new proposal with just over quorum cap ===\n")

    // Go return the excess gov tokens we have, getting us to just above the upper quorum cap
    const QUORUM_CAP = 45_000_001

    const govToken = contracts.GOV_TOKEN.contract.connect(provider)
    const deployer = await provider.getSigner(0)
    const currentBalance = new BigNumber((await govToken.balanceOf(await deployer.getAddress())).toString())

    const delta = currentBalance.shiftedBy(-18).minus(QUORUM_CAP + 1)

    console.log("[+] Current proposer balance", currentBalance.shiftedBy(-18).toFixed())
    console.log("[+] Current delta", delta.toFixed())

    await govToken.connect(deployer).transfer(F_MOVR_GRANT, delta.shiftedBy(18).toFixed())

    const updatedBalance = new BigNumber((await govToken.balanceOf(await deployer.getAddress())).toString())
    console.log("[+] New balance for proposer", updatedBalance.shiftedBy(-18).toFixed())
    if (!updatedBalance.shiftedBy(-18).isEqualTo(QUORUM_CAP + 1)){
        throw new Error("Updated holdings aren't correct!")
    }

    // Go pass a new proposal with something benign to make sure it executes
    const proposalData2: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }
    const govenor = contracts.GOVERNOR.contract.connect(provider)
    await addProposalToPropData(
        govenor,
        'sweepTokens',
        [contracts.GOV_TOKEN.address, await deployer.getAddress()],
        proposalData2
    )

    await passGovProposal(contracts, provider, proposalData2, 0, false)

    console.log('✅ New `getQuorum()` set to ', new BigNumber((await govenor.getQuorum()).toString()).shiftedBy(-18).toFixed())

    console.log("\n=== Attempting to pass new proposal with just under quorum cap (should fail) ===\n")

    // Dip voter balance to just below quorum and make sure things fail
    await govToken.connect(deployer).transfer(F_MOVR_GRANT, new BigNumber(2).shiftedBy(18).toFixed())
    const proposalData3: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }
    await addProposalToPropData(
        govenor,
        'sweepTokens',
        [contracts.GOV_TOKEN.address, await deployer.getAddress()],
        proposalData3
    )

    try {
        await passGovProposal(contracts, provider, proposalData3, 0, false)
    } catch(e) {
        if (!e.toString().includes('GovernorApollo::queue: proposal can only be queued if it is succeeded')){
            console.error('The proposal didn\'t fail as expected!')
            throw e
        } else {
            console.log("✅ Proposal errors out as expected with an unsuccessful voting period when a user has just below quorum cap")
        }
    }

}