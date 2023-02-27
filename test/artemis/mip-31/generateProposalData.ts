import {ContractBundle} from "@moonwell-fi/moonwell.js";
import {ethers} from "ethers";

export async function generateProposalData(contracts: ContractBundle, provider: ethers.providers.JsonRpcProvider){
    console.log("[+] Using provided data from Gauntlet...")

    // Provided by gauntlet
    //
    // [
    //   {
    //     "target": "0xD22Da948c0aB3A27f5570b604f3ADef5F68211C3",
    //     "calldata": "0xfca7820b00000000000000000000000000000000000000000000000003782dace9d90000",
    //     "method": "_setReserveFactor",
    //     "args": [
    //       {
    //         "type": "BigNumber",
    //         "hex": "0x03782dace9d90000"
    //       }
    //     ]
    //   },
    //   {
    //     "target": "0x8e00d5e02e65a19337cdba98bba9f84d4186a180",
    //     "calldata": "0xe4028eee000000000000000000000000d22da948c0ab3a27f5570b604f3adef5f68211c300000000000000000000000000000000000000000000000008e1bc9bf0400000",
    //     "method": "_setCollateralFactor",
    //     "args": [
    //       "0xD22Da948c0aB3A27f5570b604f3ADef5F68211C3",
    //       {
    //         "type": "BigNumber",
    //         "hex": "0x08e1bc9bf0400000"
    //       }
    //     ]
    //   }
    // ]

    return {
        "targets": [
            "0xD22Da948c0aB3A27f5570b604f3ADef5F68211C3",
            "0x8e00d5e02e65a19337cdba98bba9f84d4186a180",
        ],
        "values": [
            0,
            0,
        ],
        "signatures": [
            "",
            "",
        ],
        "callDatas": [
            "0xfca7820b00000000000000000000000000000000000000000000000003782dace9d90000",
            "0xe4028eee000000000000000000000000d22da948c0ab3a27f5570b604f3adef5f68211c300000000000000000000000000000000000000000000000008e1bc9bf0400000",
        ],
    }
}