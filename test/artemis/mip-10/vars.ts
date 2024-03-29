import {TokenHoldingsMap} from "../../../src";

export const ECOSYSTEM_RESERVE = '0x7793E08Eb4525309C46C9BA394cE33361A167ba4'
export const F_GLMR_LM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
export const C_GLMR_APPDEV = '0x519ee031E182D3E941549E7909C9319cFf4be69a'

export const SUBMITTER_WALLET = '0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5'

export const EXPECTED_STARTING_WELL_HOLDINGS : TokenHoldingsMap = {
    F_GLMR_LM: 854_159_019,
    ECOSYSTEM_RESERVE: 5_079_522,
    COMPTROLLER: 5_109_763,
    DEX_REWARDER: 3_144_801,
    SUBMITTER_WALLET: 0,
}

export const SENDAMTS = {
    ECOSYSTEM_RESERVE: 11_105_770,
    COMPTROLLER: 8_653_847,
    DEX_REWARDER: 9_086_539,
    SUBMITTER_WALLET: 100_000,
}

// Send amounts should be negative for F_GLMR_LM
SENDAMTS['F_GLMR_LM'] = -1 * (SENDAMTS['ECOSYSTEM_RESERVE'] + SENDAMTS['COMPTROLLER'] + SENDAMTS['DEX_REWARDER'] + SENDAMTS['SUBMITTER_WALLET'])
