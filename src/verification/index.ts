import {Contract, ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "ethers";
import {ContractBundle} from '@moonwell-fi/moonwell.js'

export type ProposalData = {
    targets: string[]
    values: number[]
    signatures: string[]
    callDatas: string[]
}

export async function passGovProposal(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, proposalData: ProposalData){
    console.log("[+] Submitting the following proposal to governance\n", JSON.stringify(proposalData, null ,2), '\n======')

    const governor = new ethers.Contract(
        contracts.GOVERNOR,
        require("../abi/MoonwellGovernorArtemis.json").abi,
        provider.getSigner(0) // Deployer
    )

    const proposalResult = await governor.propose(
        proposalData.targets,
        proposalData.values,
        proposalData.signatures,
        proposalData.callDatas,
        'Automated gov proposals to restart the markets'
    )
    await proposalResult.wait()
    console.log(`[+] Proposed in hash: ${proposalResult.hash}`)

    const proposalID = await governor.proposalCount()

    // Grab proposal data.
    let proposal = await governor.proposals(proposalID)

    // Delay until voting begins by waiting until the start time plus one second
    console.log("[+] Fast forwarding in time...")
    await provider.send("evm_mine", [proposal.startTimestamp.toNumber() + 1])

    // Vote for the proposal
    /*
      uint8 public constant voteValueYes = 0;
      uint8 public constant voteValueNo = 1;
      uint8 public constant voteValueAbstain = 2;
    */
    const voteValueYes = 0
    const voteResult = await governor.castVote(proposalID, voteValueYes)
    await voteResult.wait()
    console.log(`[+] Voted for proposal in ${voteResult.hash}`)

    // Delay until voting end by waiting until the end time and mining one more block
    console.log("[+] Fast forwarding in time...")
    await provider.send("evm_mine", [proposal.endTimestamp.toNumber() + 1]);

    // Queue our proposal
    const queueResult = await governor.queue(proposalID)
    await queueResult.wait()
    console.log(`[+] Queued for Execution in Hash: ${queueResult.hash}`)

    const timelock = new ethers.Contract(
        contracts.TIMELOCK,
        require("../abi/Timelock.json").abi,
        provider
    )

    // Delay for the timelock to complete by waiting for the timelock's delay, and then waiting one more block
    const delay = await timelock.delay()
    const lastBlock = await provider.getBlock("latest")
    await provider.send("evm_mine", [lastBlock.timestamp + delay.toNumber() + 1]);

    // Execute that shit yo
    const executeResult = await governor.execute(proposalID)
    await executeResult.wait()

    const receipt = await provider.getTransactionReceipt(executeResult.hash)

    console.log(`Receipt...`)
    console.log(receipt) 

    console.log('logs...')

    const comptroller = new ethers.Contract(
        contracts.COMPTROLLER,
        require('../abi/Comptroller.json').abi,
        provider
      )
      const oracle = new ethers.Contract(
        contracts.ORACLE,
        require('../abi/ChainlinkOracle.json').abi,
        provider
      )

      const token = new ethers.Contract(
        proposalData.targets[2],
        require('../../src/abi/MErc20Delegator.json').abi,
        provider
      )
    

      console.log('i am attaching to... ' + contracts.COMPTROLLER)
    for (let i = 0; i < receipt.logs.length; i++ ) {
        const log = receipt.logs[i]
        if (log.address.toUpperCase() === contracts.COMPTROLLER.toUpperCase()) {
            console.log("COMPTROLLER")
            console.log(comptroller.interface.parseLog(log))
        } else if (log.address.toUpperCase() === "0xED301cd3EB27217BDB05C4E9B820a8A3c8B665f9".toUpperCase()) {
            console.log("ORACLE")
            console.log(oracle.interface.parseLog(log))
        } else if (log.address.toUpperCase() === "0x3a9249d70dCb4A4E9ef4f3AF99a3A130452ec19B".toUpperCase()) {
            console.log("TIMELOCK")
            console.log(timelock.interface.parseLog(log))
        } else if (log.address.toUpperCase() === "0xfc4DFB17101A12C5CEc5eeDd8E92B5b16557666d".toUpperCase()) {
            console.log("GOVERNOR")
            console.log(governor.interface.parseLog(log))
        } else {
            console.log("TOKEN") 
            console.log(token.interface.parseLog(log))
        }   
    }

    console.log(`[+] Executed in hash: ${executeResult.hash}`)
}

export async function addProposalToPropData(contract: Contract, fn: string, args: any[], proposalData: any){
    const tx = await contract.populateTransaction[fn](...args)

    proposalData.targets.push(contract.address)
    proposalData.values.push(0)
    proposalData.signatures.push(contract.interface.getFunction(fn).format())
    proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args
}

export async function setupDeployerForGovernance(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, wellTreasuryAddress: string){
    const mantissa = EthersBigNumber.from(10).pow(18)

    const wellTreasury = provider.getSigner(wellTreasuryAddress)

    const deployer = await provider.getSigner(0)

    // Fund the WELL treasury
    const fundParamsMsigResult = await deployer.sendTransaction({
        to: wellTreasuryAddress,
        value: ethers.utils.parseEther("1.0")
    })
    await fundParamsMsigResult.wait(1)
    console.log(`[+] Funded wellTreasury (${await wellTreasury.getAddress()}) in ${fundParamsMsigResult.hash}`)

    // Fund the Break glass msig 
    const fundBGMsig = await deployer.sendTransaction({
        to: "0x5402447a0db03eee98c98b924f7d346bd19cdd17",
        value: ethers.utils.parseEther("1.0")
    })
    await fundBGMsig.wait(1)
    console.log(`[+] Funded bg msig in ${fundBGMsig.hash}`)

    const fundGovRetMsig = await deployer.sendTransaction({
        to: "0xffa353dacd27071217ea80d3149c9d500b0e9a38",
        value: ethers.utils.parseEther("1.0")
    })
    await fundGovRetMsig.wait(1)
    console.log(`[+] Funded gov ret msig in ${fundGovRetMsig}`)


    // Fund the break glass multis

    // // Fund the timelock treasury
    // const fundTimelockResult = await deployer.sendTransaction({
    //     to: "0x3a9249d70dCb4A4E9ef4f3AF99a3A130452ec19B",
    //     value: ethers.utils.parseEther("1.0")
    // })
    // await fundTimelockResult.wait(1)
    // console.log(`[+] Funded timelock (${await wellTreasury.getAddress()}) in ${fundTimelockResult.hash}`)    

    const govToken = new ethers.Contract(
        contracts.GOV_TOKEN,
        require('../abi/Well.json').abi,
        provider
    )

    const currentBalance = await govToken.balanceOf(await deployer.getAddress())
    if (!currentBalance.isZero()){
        throw new Error("Was expecting deployer currentBalance to be 0 WELL. Currently:", currentBalance.toString())
    } else {
        console.log("    ✅ Deployer currentBalance === 0", "WELL")
    }

    const govTokenTransferResult = await govToken
        .connect(wellTreasury)
        .transfer(
            await deployer.getAddress(),
            EthersBigNumber.from(288_000_001).mul(mantissa),
        )
    await govTokenTransferResult.wait()

    const newBalance = await govToken.balanceOf(await deployer.getAddress())
    if (newBalance.isZero()){
        throw new Error("Was expecting deployer currentBalance to be 288M WELL. Currently:", newBalance.toString())
    } else {
        console.log("    ✅ Deployer WELL balance ===", newBalance.div(mantissa).toString(), "WELL")
    }

    const govTokenDelegateResult = await govToken
        .connect(deployer)
        .delegate(await deployer.getAddress())

    console.log("[+] Delegated WELL to self in call", govTokenDelegateResult.hash)
    await govTokenDelegateResult.wait()

    const delegatesResult = await govToken.delegates(await deployer.getAddress())

    if (delegatesResult !== await deployer.getAddress()){
        throw new Error("The deployer doesn't have its voting power delegated to itself!")
    } else {
        console.log("    ✅ Deployer delegate ===", delegatesResult)
    }

    const votingPower = await govToken
        .connect(deployer)
        .getCurrentVotes(await deployer.getAddress())
    if (votingPower.isZero()){
        throw new Error("The deployer has no voting power!")
    } else {
        console.log("    ✅ Deployer has voting power ===", votingPower.div(mantissa).toString(), 'WELL')
    }
}

export const sleep = async (pauseDelay: number) => {
    await new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, pauseDelay * 1000);
    });
}

export async function startGanache(contracts: ContractBundle, forkBlock: number, unlockAddresses?: string[]){
    console.log("=== Launching a Ganache Chain ===");

    // We unlock the params and upgrades multisig.
    const command = `
    ganache
      ${unlockAddresses && unlockAddresses.map(i => '--unlock ' + i).join(' ')} 
      --fork "https://rpc.api.moonbeam.network"
      -b 1
      --default-balance-ether ${ ethers.utils.parseEther("5.0") }
  `.replace(/\n/g, ' ')
        .replace(/  +/g, ' ');

    const forkedChainProcess = require('child_process').spawn(command, [], { shell: true, detached: true })

    // Logging for ganache-cli
    // forkedChainProcess.stdout.on('data', function(data) {
    //     console.log(data.toString());
    // });

    console.log("Executed Command:")
    console.log(command)

    return forkedChainProcess
}

/**
 * Convert a whole number representing a percent to an 18 digit mantissa based number.
 * 
 * @param percent A whole number representing a percent. Ex. Pass 70 for 70%.
 * @returns A percent represented as an 18 digit mantissa. Ex. 700_000_000_000_000_000 for 70%.
 */
export function percentTo18DigitMantissa(percent: number): ethers.BigNumber {
    return EthersBigNumber.from(percent).mul(EthersBigNumber.from("10").pow("16"))
}