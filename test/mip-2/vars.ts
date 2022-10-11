export const fGLMRLM = '0x6972f25AB3FC425EaF719721f0EBD1Cdb58eE451'
export const fGLMRDEVGRANT = '0xF130e4946F862F2c6CA3d007D51C21688908e006'

export const ECOSYSTEM_RESERVE = '0x7793E08Eb4525309C46C9BA394cE33361A167ba4'
export const DEX_REWARDER = '0xcD04D2340c1dD9B3dB2C5c53c8B8bAa57b2654Be'
export const STKWELL = '0x8568A675384d761f36eC269D695d6Ce4423cfaB1'

export const WALLET_TO_PAY = '0x7e4a3edd2F6C516166b4C615884b69B7dbfF3fE5'
export const WALLET_PAYMENT_AMOUNT = 100_000

// This changes every block as rewards are pulled out of things, so needs
// to match the FORK_BLOCK state of the world.
export const EXPECTED_STARTING_WELL_HOLDINGS = {
    EcosystemReserve: 2_249_463,
    Unitroller: 4_439_065,
    "Dex Rewarder": 2_387_567,
    "F-GLMR-LM": 765_789_027,
}

// Amounts to send off to places
export const SENDAMTS = {
    EcosystemReserve: 4_182_693,
    Unitroller: 4_759_616,
    'Dex Rewarder': 5_480_770,
}

