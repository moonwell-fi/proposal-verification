import {ethers} from "ethers";
import {
    assertDexRewarderRewardsPerSec, assertMarketGovTokenRewardSpeed, assertMarketNativeTokenRewardSpeed,
    assertRoundedWellBalance,
    assertSTKWellEmissionsPerSecond
} from "../../src/verification/assertions";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    ECOSYSTEM_RESERVE,
    EXPECTED_STARTING_MFAM_HOLDINGS,
    fMOVRGrant,
    SENDAMTS,
    SUBMITTER_WALLET
} from "./vars";
import BigNumber from "bignumber.js";

export async function assertExpectedEndState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting protocol is in an expected state AFTER gov proposal passed")

    // Assert that F-MOVR-GRANT ends with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        fMOVRGrant,
        'F-MOVR-GRANT',
        EXPECTED_STARTING_MFAM_HOLDINGS['F-MOVR-GRANT'] - SENDAMTS['ECOSYSTEM_RESERVE'] - SENDAMTS['COMPTROLLER'] - SENDAMTS['DEX_REWARDER'] - SENDAMTS['SUBMITTER_WALLET']
    )

    // Assert that the ECOSYSTEM_RESERVE ends with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        ECOSYSTEM_RESERVE,
        'EcosystemReserve',
        EXPECTED_STARTING_MFAM_HOLDINGS['ECOSYSTEM_RESERVE'] + SENDAMTS['ECOSYSTEM_RESERVE']
    )

    // Assert that the COMPTROLLER ends with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        contracts.COMPTROLLER.address,
        'Comptroller',
        EXPECTED_STARTING_MFAM_HOLDINGS['COMPTROLLER'] + SENDAMTS['COMPTROLLER']
    )

    // Assert that the DEX_REWARDER ends with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        contracts.DEX_REWARDER.address,
        'DEX_REWARDER',
        EXPECTED_STARTING_MFAM_HOLDINGS['DEX_REWARDER'] + SENDAMTS['DEX_REWARDER'] - 1 // -1 for rounding errors
    )

    // Assert that the DEX_REWARDER ends with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        SUBMITTER_WALLET,
        'SUBMITTER_WALLET',
        EXPECTED_STARTING_MFAM_HOLDINGS['SUBMITTER_WALLET'] + SENDAMTS['SUBMITTER_WALLET']
    )

    // Assert current reward speeds for DEX_REWARDER
    await assertDexRewarderRewardsPerSec(contracts, provider,
        11,
        22,
        new BigNumber('5.198326554715510000').times(1e18)
    )

    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('1.559497966414650000').times(1e18)
    )

    // Assert market speeds before adjustment
    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'MOVR',
        new BigNumber('0.127893518518519000').times(1e18),
        new BigNumber('0.300925925925926000').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'MOVR',
        new BigNumber('0.000384041666666667').times(1e18),
        new BigNumber('0.000896097222222222').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'xcKSM',
        new BigNumber('0.131944444444444000').times(1e18),
        new BigNumber('0.131944444444444000').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'xcKSM',
        new BigNumber('0.000393888888888889').times(1e18),
        new BigNumber('0.000393888888888889').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'ETH.multi',
        new BigNumber('0.137731481481481').times(1e18),
        new BigNumber('0.324074074074074').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'ETH.multi',
        new BigNumber('0.000413583333333333').times(1e18),
        new BigNumber('0.000965027777777778').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'USDC.multi',
        new BigNumber('0.344328703703704000').times(1e18),
        new BigNumber('0.810185185185185000').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'USDC.multi',
        new BigNumber('0.001033958333333330').times(1e18),
        new BigNumber('0.002412569444444440').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'USDT.multi',
        new BigNumber('0.098379629629629600').times(1e18),
        new BigNumber('0.231481481481481000').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'USDT.multi',
        new BigNumber('0.000295416666666667').times(1e18),
        new BigNumber('0.000689305555555556').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'FRAX',
        new BigNumber('0.196759259259259000').times(1e18),
        new BigNumber('0.462962962962963000').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'FRAX',
        new BigNumber('0.000590833333333333').times(1e18),
        new BigNumber('0.001378611111111110').times(1e18),
    )
}