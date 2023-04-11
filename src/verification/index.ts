import {Contract, ethers} from "ethers";
import {BigNumber as EthersBigNumber} from "ethers";
import {ContractBundle, Market, Contracts} from '@moonwell-fi/moonwell.js'
import {
    assertMarketGovTokenRewardSpeed,
    assertMarketNativeTokenRewardSpeed,
    assertRoundedWellBalance
} from "./assertions";
import BigNumber from "bignumber.js";

export enum REWARD_TYPES {
    GOVTOKEN,
    NATIVE
}

export type ProposalData = {
    targets: string[]
    values: number[]
    signatures: string[]
    callDatas: string[]
}

export type SupplyAndBorrowData = {
    expectedSupply: BigNumber,
    expectedBorrow: BigNumber
}

export type MarketRewardMap = {
    [ticker:string]: {
        [RewardType in REWARD_TYPES]?: SupplyAndBorrowData
    }
}

export type TokenHoldingsMap = {
    [key:string]: number
}


export async function passLatestGovProposal(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, signerAddressOrIndex: number | string = 0){
    console.log('[+] Passing most recent gov proposal pending in the timelock...')
    const governor = contracts.GOVERNOR.contract.connect(provider.getSigner(signerAddressOrIndex))

    const latestProposal = await governor.proposals(await governor.proposalCount())

    const voteValueYes = 0
    const voteResult = await governor.castVote(latestProposal.id, voteValueYes)
    await voteResult.wait()
    console.log(`[+] Voted for proposal in ${voteResult.hash}`)

    // Delay until voting end by waiting until the end time and mining one more block
    console.log("[+] Fast forwarding in time...")
    await provider.send("evm_mine", [latestProposal.endTimestamp.toNumber() + 1]);

    // Queue our proposal
    const queueResult = await governor.queue(latestProposal.id)
    await queueResult.wait()
    console.log(`[+] Queued for Execution in Hash: ${queueResult.hash}`)

    const timelock = contracts.TIMELOCK.contract.connect(provider)

    // Delay for the timelock to complete by waiting for the timelock's delay, and then waiting one more block
    const delay = await timelock.delay()
    const lastBlock = await provider.getBlock("latest")
    await provider.send("evm_mine", [lastBlock.timestamp + delay.toNumber() + 1]);

    // Execute that shit yo
    const executeResult = await governor.execute(latestProposal.id)
    await executeResult.wait()

    console.log(`[+] Executed in hash: ${executeResult.hash}`)
}

export async function passGovProposal(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, proposalData: ProposalData, signerAddressOrIndex: number | string = 0, shouldLogProposal = true){
    shouldLogProposal && console.log("[+] Submitting the following proposal to governance\n" + JSON.stringify(proposalData, null ,2), '\n======')

    const governor = contracts.GOVERNOR.contract.connect(provider.getSigner(signerAddressOrIndex))

    const proposalResult = await governor.propose(
        proposalData.targets,
        proposalData.values,
        proposalData.signatures,
        proposalData.callDatas,
        'Gov proposal unit test'
    )
    await proposalResult.wait()
    shouldLogProposal && console.log(`[+] Proposed in hash: ${proposalResult.hash}`)

    const proposalID = await governor.proposalCount()

    // Grab proposal data.
    let proposal = await governor.proposals(proposalID)

    // Delay until voting begins by waiting until the start time plus one second
    shouldLogProposal && console.log("[+] Fast forwarding in time...")
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
    shouldLogProposal && console.log(`[+] Voted for proposal in ${voteResult.hash}`)

    // Delay until voting end by waiting until the end time and mining one more block
    shouldLogProposal && console.log("[+] Fast forwarding in time...")
    await provider.send("evm_mine", [proposal.endTimestamp.toNumber() + 1]);

    // Queue our proposal
    const queueResult = await governor.queue(proposalID)
    await queueResult.wait()
    shouldLogProposal && console.log(`[+] Queued for Execution in Hash: ${queueResult.hash}`)

    const timelock = contracts.TIMELOCK.contract.connect(provider)

    // Delay for the timelock to complete by waiting for the timelock's delay, and then waiting one more block
    const delay = await timelock.delay()
    const lastBlock = await provider.getBlock("latest")
    await provider.send("evm_mine", [lastBlock.timestamp + delay.toNumber() + 1]);

    // Execute that shit yo
    const executeResult = await governor.execute(proposalID)
    await executeResult.wait()

    shouldLogProposal && console.log(`[+] Executed in hash: ${executeResult.hash}`)
}

export async function addProposalToPropData(contract: Contract, fn: string, args: any[], proposalData: any){
    const tx = await contract.populateTransaction[fn](...args)

    proposalData.targets.push(contract.address)
    proposalData.values.push(0)
    proposalData.signatures.push(contract.interface.getFunction(fn).format())
    proposalData.callDatas.push('0x' + tx.data!.slice(10)) // chop off the method selector from the args
}

export async function setupDeployerAndEnvForGovernance(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider, wellTreasuryAddress: string, forkBlock: number, quorumBuffer = 1){
    const mantissa = EthersBigNumber.from(10).pow(18)

    // Mine a block to set the initial block timestamp
    const forkedBlock = await provider.getBlock(forkBlock)
    await provider.send("evm_mine", [forkedBlock.timestamp + 1])

    const wellTreasury = provider.getSigner(wellTreasuryAddress)

    const deployer = await provider.getSigner(0)

    // Fund the WELL treasury
    await provider.send('evm_setAccountBalance',
        [wellTreasuryAddress, 1e18]
    )
    console.log(`[+] Funded wellTreasury (${await wellTreasury.getAddress()}) with 1 native token`)

    const govToken = contracts.GOV_TOKEN.contract.connect(provider)
    const governor = contracts.GOVERNOR.contract.connect(provider)

    let amountToTransfer
    if (contracts.GOVERNOR === Contracts.moonriver.GOVERNOR){
        // Floating quorum
        amountToTransfer = (await governor.getQuorum())
                                .add(
                                    EthersBigNumber
                                        .from(quorumBuffer)
                                        .mul(mantissa)
                                )
    } else {
        amountToTransfer = (await governor.quorumVotes())
                                .add(
                                    EthersBigNumber
                                        .from(quorumBuffer)
                                        .mul(mantissa)
                                )
    }

    const currentBalance = await govToken.balanceOf(await deployer.getAddress())
    if (!currentBalance.isZero()){
        throw new Error(`Was expecting deployer currentBalance to be 0 ${govTokenTicker(contracts)}. Currently:`, currentBalance.toString())
    } else {
        console.log("    ✅ Deployer currentBalance === 0", govTokenTicker(contracts))
    }

    const govTokenTransferResult = await govToken
        .connect(wellTreasury)
        .transfer(
            await deployer.getAddress(),
            amountToTransfer,
        )
    await govTokenTransferResult.wait()

    const newBalance = await govToken.balanceOf(await deployer.getAddress())
    if (newBalance.isZero()){
        throw new Error(`Was expecting deployer currentBalance to be ${amountToTransfer} ${govTokenTicker(contracts)}. Currently:`, newBalance.toString())
    } else {
        console.log(`    ✅ Deployer ${govTokenTicker(contracts)} balance ===`, newBalance.div(mantissa).toString(), govTokenTicker(contracts))
    }

    const govTokenDelegateResult = await govToken
        .connect(deployer)
        .delegate(await deployer.getAddress())

    console.log(`[+] Delegated ${govTokenTicker(contracts)} to self in call`, govTokenDelegateResult.hash)
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
        console.log("    ✅ Deployer has voting power ===", votingPower.div(mantissa).toString(), govTokenTicker(contracts))
    }
}

export const sleep = async (pauseDelay: number) => {
    await new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, pauseDelay * 1000);
    });
}

export async function startGanache(contracts: ContractBundle, forkBlock: number, rpcURL: string, unlockAddresses?: string[]){
    console.log("=== Launching a Ganache Chain ===");

    // TODO: see if we're running on ganache 6 or 7 :rolling-eyes:

    // We unlock the params and upgrades multisig.
    const command = `
    ganache-cli
      ${unlockAddresses && unlockAddresses.map(i => '--wallet.unlockedAccounts ' + i).join(' ')} 
      --fork.url "${rpcURL}"
      --fork.blockNumber ${forkBlock}
      --server.host=0.0.0.0
      --wallet.defaultBalance ${ ethers.utils.parseEther("2.0") }
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

export async function replaceXCAssetWithDummyERC20(provider: ethers.providers.JsonRpcProvider, marketToClone: Market, marketToReplace: Market){
    // Push the code into the address of the xc asset
    await provider.send('evm_setAccountCode', [
        marketToReplace.tokenAddress,
        await provider.getCode(
            marketToClone.tokenAddress
        )
    ])

    // Go clone the first 15 slots, and hope that is sufficient for whatever parameters are accessed as part of
    // the proposal.
    //
    // NOTE: you may need to do other things like set the right data at a specific slot to do things like override
    // a symbol or decimals or something, check below for an example of doing that.
    for (const slot of Array.from(Array(15).keys())){
        // console.log("Cloning storage slot", slot)
        const marketStorage = await provider.getStorageAt(
            marketToClone.tokenAddress,
            EthersBigNumber.from(slot)
        )
        // console.log(slot, marketStorage)
        await provider.send('evm_setAccountStorageAt', [
            marketToReplace.tokenAddress,
            ethers.utils.hexZeroPad("0x" + slot.toString(16), 32),
            ethers.utils.hexZeroPad(marketStorage, 32)
        ])
    }

    // Neat parlor trick, if you pass in FRAX on Moonbeam, the `_symbol` is stored in slot 4, and we can set it
    // to whatever we want. The code below ensures that the `_symbol` returned by xcDOT is correct even while
    // cloning the FRAX contract
    // https://moonscan.io/address/0x322e86852e492a7ee17f28a78c663da38fb33bfb#code
    // Line 498
    // const marketStorage = await provider.getStorageAt(
    //     marketToClone.tokenAddress,
    //     EthersBigNumber.from(4)
    // )
    // console.log("marketStorage", marketStorage)
    // await provider.send('evm_setAccountStorageAt', [
    //     // Target
    //     marketToReplace.tokenAddress,
    //     // Slot
    //     ethers.utils.hexZeroPad("0x" + (4).toString(16), 32),
    //     // New Data
    //     new BigNumber(
    //         ethers.utils.formatBytes32String('xcDOT')
    //     )
    //         .plus('xcDOT'.length * 2) // Storage strings are UTF-8 and have their size encoded into them, so double ascii length and add this to the message
    //         .toString(16) // Format as a hex string
    //         .replace(/^/, '0x') // Add 0x prefix
    // ])
}

export async function assertMarketRewardState(
    contracts: ContractBundle,
    provider: ethers.providers.JsonRpcProvider,
    marketRewardMap: MarketRewardMap,
    extraMarketAddresses: any = {}
) {
    for (const [assetTicker, data] of Object.entries(marketRewardMap)) {

        if (data[REWARD_TYPES.GOVTOKEN]){
            await assertMarketGovTokenRewardSpeed(
                contracts,
                provider,
                assetTicker,
                data[REWARD_TYPES.GOVTOKEN].expectedSupply,
                data[REWARD_TYPES.GOVTOKEN].expectedBorrow,
                extraMarketAddresses
            )
        }
        if (data[REWARD_TYPES.NATIVE]){
            await assertMarketNativeTokenRewardSpeed(
                contracts,
                provider,
                assetTicker,
                data[REWARD_TYPES.NATIVE].expectedSupply,
                data[REWARD_TYPES.NATIVE].expectedBorrow,
                extraMarketAddresses
            )
        }
    }
}

export function govTokenTicker(contracts){
    if (contracts.COMPTROLLER === Contracts.moonriver.COMPTROLLER){
        return "MFAM"
    } else {
        return "WELL"
    }
}
export function nativeTicker(contracts){
    if (contracts.COMPTROLLER === Contracts.moonriver.COMPTROLLER){
        return "MOVR"
    } else {
        return "GLMR"
    }
}

export async function addMarketAdjustementsToProposal(
    contracts : ContractBundle,
    unitroller : Contract,
    proposalData: any,
    marketRewardMap: MarketRewardMap,
    extraMarketAddresses: any = {}
){
    // For each market
    const spacer = '\n            - '

    for (const [assetTicker, data] of Object.entries(marketRewardMap)){
        // And each reward type
        for (let [assetType, supplyBorrowData] of Object.entries(data)){
            const ticker = parseInt(assetType) === REWARD_TYPES.GOVTOKEN ? govTokenTicker(contracts) : nativeTicker(contracts)
            console.log([
                `    📝 Adding proposal call for \`_setRewardSpeed\` on the ${assetTicker} market with emissions:`,
                `SUPPLY: ` + spacer + [
                    `${supplyBorrowData.expectedSupply.div(1e18).toFixed(18)} ${ticker}/sec`,
                    `${parseFloat(supplyBorrowData.expectedSupply.div(1e18).times(86400).toFixed(2)).toLocaleString()} ${ticker}/day`,
                    `${parseFloat(supplyBorrowData.expectedSupply.div(1e18).times(86400).times(30).toFixed(2)).toLocaleString()} ${ticker}/month`
                ].join(spacer),
                `BORROW: ` + spacer + [
                    `${supplyBorrowData.expectedBorrow.div(1e18).toFixed(18)} ${ticker}/sec`,
                    `${parseFloat(supplyBorrowData.expectedBorrow.div(1e18).times(86400).toFixed(2)).toLocaleString()} ${ticker}/day`,
                    `${parseFloat(supplyBorrowData.expectedBorrow.div(1e18).times(86400).times(30).toFixed(2)).toLocaleString()} ${ticker}/month`
                ].join(spacer),
            ].join('\n        '))
            // Add the proposed reward speed
            await addProposalToPropData(unitroller, '_setRewardSpeed',
                [
                    EthersBigNumber.from(assetType), // 0 = WELL, 1 = GLMR
                    contracts.MARKETS[assetTicker]?.mTokenAddress ?? extraMarketAddresses[assetTicker],
                    EthersBigNumber.from(supplyBorrowData.expectedSupply.toFixed()),
                    EthersBigNumber.from(supplyBorrowData.expectedBorrow.toFixed()),
                ],
                proposalData
            )
        }
    }
}

export async function assertCurrentExpectedGovTokenHoldings(contracts : ContractBundle, provider: ethers.providers.JsonRpcProvider, tokenHoldingsMap: TokenHoldingsMap, nameMap: any){
    for (const [holderName, amount] of Object.entries(tokenHoldingsMap)) {
        if (contracts[holderName]){
            await assertRoundedWellBalance(contracts, provider,
                contracts[holderName].address,
                holderName,
                amount
            )
        } else {
            await assertRoundedWellBalance(contracts, provider,
                nameMap[holderName],
                holderName,
                amount
            )
        }
    }
}

export async function assertEndingExpectedGovTokenHoldings(contracts : ContractBundle, provider: ethers.providers.JsonRpcProvider, tokenHoldingsMap: TokenHoldingsMap, sendMap: TokenHoldingsMap, nameMap: any){
    for (const [holderName, amount] of Object.entries(tokenHoldingsMap)) {
        if (contracts[holderName]){
            await assertRoundedWellBalance(contracts, provider,
                contracts[holderName].address,
                holderName,
                amount + sendMap[holderName]
            )
        } else {
            if (!sendMap[holderName]){
                throw new Error(`Holder ${holderName} not found in sendmap! If this is the main treasury make sure you're using a negative number here to captures outflows for validation.`)
            }
            await assertRoundedWellBalance(contracts, provider,
                nameMap[holderName],
                holderName,
                amount + sendMap[holderName]
            )
        }
    }
}