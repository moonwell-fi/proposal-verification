import {ethers} from "ethers";
import {
    assertDexRewarderRewardsPerSec, assertMarketGovTokenRewardSpeed,
    assertRoundedWellBalance,
    assertSTKWellEmissionsPerSecond
} from "../../src/verification/assertions";
import BigNumber from "bignumber.js";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE,
    EXPECTED_STARTING_WELL_HOLDINGS,
    fGLMRLM,
    SENDAMTS,
    WALLET_PAYMENT_AMOUNT,
    WALLET_TO_PAY
} from "./vars";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    await assertRoundedWellBalance(contracts, provider,
        ECOSYSTEM_RESERVE,
        'EcosystemReserve',
        EXPECTED_STARTING_WELL_HOLDINGS["EcosystemReserve"] + SENDAMTS['EcosystemReserve']
    )
    await assertRoundedWellBalance(contracts, provider,
        contracts.COMPTROLLER.address,
        'Unitroller',
        EXPECTED_STARTING_WELL_HOLDINGS['Unitroller'] + SENDAMTS['Unitroller']
    )
    await assertRoundedWellBalance(contracts, provider,
        contracts.DEX_REWARDER.address,
        'Dex Rewarder',
        EXPECTED_STARTING_WELL_HOLDINGS['Dex Rewarder'] + SENDAMTS['Dex Rewarder'] - 1 // - 1 because of rounding with the dex rewarder
    )

    await assertRoundedWellBalance(contracts, provider,
        fGLMRLM,
        'F-GLMR-LM',
        EXPECTED_STARTING_WELL_HOLDINGS['F-GLMR-LM'] - SENDAMTS['EcosystemReserve'] - SENDAMTS['Unitroller'] - SENDAMTS['Dex Rewarder']
    )

    await assertDexRewarderRewardsPerSec(contracts, provider,
        15,
        6,
        new BigNumber('2.26552960927961').times(1e18)
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('1.72895680708181').times(1e18)
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        contracts.MARKETS['GLMR'].mTokenAddress,
        new BigNumber('0.649253090659341').times(1e18),
        new BigNumber(1)
    )
    await assertMarketGovTokenRewardSpeed(contracts, provider,
        contracts.MARKETS['xcDOT'].mTokenAddress,
        new BigNumber('0.668927426739927').times(1e18),
        new BigNumber(1)
    )
    await assertMarketGovTokenRewardSpeed(contracts, provider,
        contracts.MARKETS['FRAX'].mTokenAddress,
        new BigNumber('0.649253090659341').times(1e18),
        new BigNumber(1)
    )

    await assertRoundedWellBalance(contracts, provider,
        WALLET_TO_PAY,
        'Delegate Wallet',
        WALLET_PAYMENT_AMOUNT
    )
}