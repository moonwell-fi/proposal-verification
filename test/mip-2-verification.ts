import {BigNumber as EthersBigNumber, ethers} from 'ethers'
import BigNumber from "bignumber.js";
import {
    addProposalToPropData,
    passGovProposal,
    setupDeployerForGovernance,
    sleep,
    startGanache
} from "../src";
import {
    assertDexRewarderRewardsPerSec, assertMarketWellRewardSpeed,
    assertRoundedWellBalance,
    assertSTKWellEmissionsPerSecond
} from "../src/verification/assertions";

import {moonwellContracts, ContractBundle} from '@moonwell-fi/moonwell.js'

ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);

const fGLMRLM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
const fGLMRDEVGRANT = '0xF130e4946F862F2c6CA3d007D51C21688908e006'

const ECOSYSTEM_RESERVE = '0x7793E08Eb4525309C46C9BA394cE33361A167ba4'
const DEX_REWARDER = '0xcD04D2340c1dD9B3dB2C5c53c8B8bAa57b2654Be'
const STKWELL = '0x8568A675384d761f36eC269D695d6Ce4423cfaB1'

const WALLET_TO_PAY = '0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5'
const WALLET_PAYMENT_AMOUNT = 100_000

const FORK_BLOCK = 1966448

// This changes every block as rewards are pulled out of things, so needs
// to match the FORK_BLOCK state of the world.
const EXPECTED_STARTING_WELL_HOLDINGS = {
    EcosystemReserve: 2_249_463,
    Unitroller: 4_439_065,
    "Dex Rewarder": 2_387_567,
    "F-GLMR-LM": 765_789_027,
}

// Amounts to send off to places
const SENDAMTS = {
    EcosystemReserve: 4_182_693,
    Unitroller: 4_759_616,
    'Dex Rewarder': 5_480_770,
}

async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    // Assert that the unitroller, ecosystemReserve, F-GLMR-LM, and dex rewarder all have expected amounts of WELL
    await assertRoundedWellBalance(contracts, provider,
        ECOSYSTEM_RESERVE,
        'EcosystemReserve',
        EXPECTED_STARTING_WELL_HOLDINGS['EcosystemReserve']
    )
    await assertRoundedWellBalance(contracts, provider,
        contracts.COMPTROLLER,
        'Unitroller',
        EXPECTED_STARTING_WELL_HOLDINGS['Unitroller']
    )
    await assertRoundedWellBalance(contracts, provider,
        DEX_REWARDER,
        'Dex Rewarder',
        EXPECTED_STARTING_WELL_HOLDINGS['Dex Rewarder']
    )
    await assertRoundedWellBalance(contracts, provider,
        fGLMRLM,
        'F-GLMR-LM',
        EXPECTED_STARTING_WELL_HOLDINGS['F-GLMR-LM']
    )

    await assertRoundedWellBalance(contracts, provider,
        WALLET_TO_PAY,
        'Delegate Wallet',
        0
    )

    // Assert current reward speeds
    await assertDexRewarderRewardsPerSec(DEX_REWARDER, provider,
        15,
        5,
        new BigNumber('2.384768009768010000').times(1e18)
    )

    // Assert current WELL emissions
    await assertSTKWellEmissionsPerSecond(STKWELL, provider,
        new BigNumber('1.192384004884').times(1e18)
    )

    // Assert market speeds before adjustment
    await assertMarketWellRewardSpeed(contracts, provider,
        'GLMR',
        new BigNumber('0.786973443223443').times(1e18),
        new BigNumber(1)
    )
    await assertMarketWellRewardSpeed(contracts, provider,
        'xcDOT',
        new BigNumber('0.810821123321123000').times(1e18),
        new BigNumber(1)
    )
    await assertMarketWellRewardSpeed(contracts, provider,
        'FRAX',
        new BigNumber('0.786973443223443').times(1e18),
        new BigNumber(1)
    )
}

async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    await assertRoundedWellBalance(contracts, provider,
        ECOSYSTEM_RESERVE,
        'EcosystemReserve',
        EXPECTED_STARTING_WELL_HOLDINGS["EcosystemReserve"] + SENDAMTS['EcosystemReserve']
    )
    await assertRoundedWellBalance(contracts, provider,
        contracts.COMPTROLLER,
        'Unitroller',
        EXPECTED_STARTING_WELL_HOLDINGS['Unitroller'] + SENDAMTS['Unitroller']
    )
    await assertRoundedWellBalance(contracts, provider,
        DEX_REWARDER,
        'Dex Rewarder',
        EXPECTED_STARTING_WELL_HOLDINGS['Dex Rewarder'] + SENDAMTS['Dex Rewarder'] - 1 // - 1 because of rounding with the dex rewarder
    )

    await assertRoundedWellBalance(contracts, provider,
        fGLMRLM,
        'F-GLMR-LM',
        EXPECTED_STARTING_WELL_HOLDINGS['F-GLMR-LM'] - SENDAMTS['EcosystemReserve'] - SENDAMTS['Unitroller'] - SENDAMTS['Dex Rewarder']
    )

    await assertDexRewarderRewardsPerSec(DEX_REWARDER, provider,
        15,
        6,
        new BigNumber('2.26552960927961').times(1e18)
    )

    await assertSTKWellEmissionsPerSecond(STKWELL, provider,
        new BigNumber('1.72895680708181').times(1e18)
    )

    await assertMarketWellRewardSpeed(contracts, provider,
        'GLMR',
        new BigNumber('0.649253090659341').times(1e18),
        new BigNumber(1)
    )
    await assertMarketWellRewardSpeed(contracts, provider,
        'xcDOT',
        new BigNumber('0.668927426739927').times(1e18),
        new BigNumber(1)
    )
    await assertMarketWellRewardSpeed(contracts, provider,
        'FRAX',
        new BigNumber('0.649253090659341').times(1e18),
        new BigNumber(1)
    )

    await assertRoundedWellBalance(contracts, provider,
        WALLET_TO_PAY,
        'Delegate Wallet',
        WALLET_PAYMENT_AMOUNT
    )
}

async function getProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    const mantissa = EthersBigNumber.from(10).pow(18)

    const proposalData: any = {
        targets: [],
        values: [],
        signatures: [],
        callDatas: [],
    }

    const wellToken = new ethers.Contract(
        contracts.GOV_TOKEN,
        require('../src/abi/Well.json').abi,
        provider
    )
    const dexRewarder = new ethers.Contract(
        DEX_REWARDER,
        require('../src/abi/dexRewarder.json').abi,
        provider
    )
    const stkWELL = new ethers.Contract(
        STKWELL,
        require('../src/abi/StakedWell.json').abi,
        provider
    )
    const unitroller = new ethers.Contract(
        contracts.COMPTROLLER,
        require('../src/abi/Comptroller.json').abi,
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

test("mip-2-verifications", async () => {

    const contracts = moonwellContracts.moonbeam

    const fGLMRLM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
    const cGLMRAPPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

    const forkedChainProcess = await startGanache(
        contracts,
        FORK_BLOCK,
        [fGLMRLM, cGLMRAPPDEV]
    )

    console.log("Waiting 5 seconds for chain to bootstrap...")
    await sleep(5)

    try {
        const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545')

        // Go transfer WELL to the deployer key from the cGLMRAPPDEV treasury, delegate those well to the deployer,
        // and assert the deployer has enough voting power to pass a proposal
        await setupDeployerForGovernance(contracts, provider, cGLMRAPPDEV)

        await assertCurrentExpectedState(contracts, provider)

        // Generate new proposal data
        const proposalData = await getProposalData(contracts, provider)

        // Pass the proposal
        await passGovProposal(contracts, provider, proposalData)

        // Assert that our end state is as desired
        await assertExpectedEndState(contracts, provider)
    } finally {
        // Kill our child chain.
        console.log("Shutting down Ganache chain. PID", forkedChainProcess.pid!)
        process.kill(-forkedChainProcess.pid!)
        console.log("Ganache chain stopped.")
    }
});
