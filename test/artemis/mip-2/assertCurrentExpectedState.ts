import {ethers} from "ethers";
import {
    assertDexRewarderRewardsPerSec, assertMarketGovTokenRewardSpeed,
    assertRoundedWellBalance,
    assertSTKWellEmissionsPerSecond
} from "../../../src/verification/assertions";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE,
    EXPECTED_STARTING_WELL_HOLDINGS,
    fGLMRLM,
    WALLET_TO_PAY
} from "./vars";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state")

    // Assert that the unitroller, ecosystemReserve, F-GLMR-LM, and dex rewarder all have expected amounts of WELL
    await assertRoundedWellBalance(contracts, provider,
        ECOSYSTEM_RESERVE,
        'EcosystemReserve',
        EXPECTED_STARTING_WELL_HOLDINGS['EcosystemReserve']
    )
    await assertRoundedWellBalance(contracts, provider,
        contracts.COMPTROLLER.address,
        'Unitroller',
        EXPECTED_STARTING_WELL_HOLDINGS['Unitroller']
    )
    await assertRoundedWellBalance(contracts, provider,
        contracts.DEX_REWARDER.address,
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
    await assertDexRewarderRewardsPerSec(contracts, provider,
        15,
        5,
        new BigNumber('2.384768009768010000').times(1e18)
    )

    // Assert current WELL emissions
    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('1.192384004884').times(1e18)
    )

    // Assert market speeds before adjustment
    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'GLMR',
        new BigNumber('0.786973443223443').times(1e18),
        new BigNumber(1)
    )
    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'xcDOT',
        new BigNumber('0.810821123321123000').times(1e18),
        new BigNumber(1)
    )
    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'FRAX',
        new BigNumber('0.786973443223443').times(1e18),
        new BigNumber(1)
    )
}
