import {ethers} from "ethers";
import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {
    assertDexRewarderRewardsPerSec, assertMarketGovTokenRewardSpeed, assertMarketNativeTokenRewardSpeed,
    assertRoundedWellBalance,
    assertSTKWellEmissionsPerSecond
} from "../../../src/verification/assertions";
import {ECOSYSTEM_RESERVE, EXPECTED_STARTING_MFAM_HOLDINGS, F_MOVR_GRANT, SUBMITTER_WALLET} from "./vars";
import BigNumber from "bignumber.js";
import {govTokenTicker} from "../../../src";

export async function assertCurrentExpectedState(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Asserting market configurations are in an expected state BEFORE proposal")

    // Assert that F-MOVR-GRANT starts with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        F_MOVR_GRANT,
        'F-MOVR-GRANT',
        EXPECTED_STARTING_MFAM_HOLDINGS['F-MOVR-GRANT']
    )

    // Assert that SUBMITTER_WALLET starts with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        SUBMITTER_WALLET,
        'SUBMITTER_WALLET',
        EXPECTED_STARTING_MFAM_HOLDINGS['SUBMITTER_WALLET']
    )

    // Assert that the ECOSYSTEM_RESERVE starts with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        ECOSYSTEM_RESERVE,
        'EcosystemReserve',
        EXPECTED_STARTING_MFAM_HOLDINGS['ECOSYSTEM_RESERVE']
    )

    // Assert that the COMPTROLLER starts with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        contracts.COMPTROLLER.address,
        'Comptroller',
        EXPECTED_STARTING_MFAM_HOLDINGS['COMPTROLLER']
    )

    // Assert that the DEX_REWARDER starts with an expected amt
    await assertRoundedWellBalance(contracts, provider,
        contracts.DEX_REWARDER.address,
        'DEX_REWARDER',
        EXPECTED_STARTING_MFAM_HOLDINGS['DEX_REWARDER']
    )

    // Assert current reward speeds for DEX_REWARDER
    await assertDexRewarderRewardsPerSec(contracts, provider,
        11,
        21,
        new BigNumber('5.315678137644940000').times(1e18),
        govTokenTicker(contracts)
    )

    // Assert current WELL emissions
    await assertSTKWellEmissionsPerSecond(contracts, provider,
        new BigNumber('1.3608136032371').times(1e18),
        govTokenTicker(contracts)
    )

    // Assert market speeds before adjustment
    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'MOVR',
        new BigNumber('0.147569444444444').times(1e18),
        new BigNumber('0.347222222222222').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'MOVR',
        new BigNumber('0.000590833333333333').times(1e18),
        new BigNumber('0.001378611111111110').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'xcKSM',
        new BigNumber('0.164930555555556').times(1e18),
        new BigNumber('0.164930555555556').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'xcKSM',
        new BigNumber('0.000656481481481482').times(1e18),
        new BigNumber('0.000656481481481482').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'ETH.multi',
        new BigNumber('0.137731481481481').times(1e18),
        new BigNumber('0.324074074074074').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'ETH.multi',
        new BigNumber('0.000551444444444445').times(1e18),
        new BigNumber('0.001286703703703700').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'USDC.multi',
        new BigNumber('0.324652777777778').times(1e18),
        new BigNumber('0.763888888888889').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'USDC.multi',
        new BigNumber('0.001299833333333330').times(1e18),
        new BigNumber('0.003032944444444440').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'USDT.multi',
        new BigNumber('0.0983796296296296').times(1e18),
        new BigNumber('0.231481481481481').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'USDT.multi',
        new BigNumber('0.000393888888888889').times(1e18),
        new BigNumber('0.000919074074074074').times(1e18),
    )

    await assertMarketGovTokenRewardSpeed(contracts, provider,
        'FRAX',
        new BigNumber('0.177083333333333').times(1e18),
        new BigNumber('0.416666666666667').times(1e18),
    )
    await assertMarketNativeTokenRewardSpeed(contracts, provider,
        'FRAX',
        new BigNumber('0.000709000000000000').times(1e18),
        new BigNumber('0.001654333333333330').times(1e18),
    )

}
