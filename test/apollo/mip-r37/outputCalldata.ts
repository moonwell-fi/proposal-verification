import { BigNumber as EthersBigNumber } from "@ethersproject/bignumber/lib/bignumber";
import { Contracts } from "@moonwell-fi/moonwell.js";
import BigNumber from "bignumber.js";

// Configuration
const MARKETS_TO_UPDATE = ['MOVR', 'xcKSM', 'FRAX'] as const;
const NEW_COLLATERAL_FACTOR = 7.5; // 7.5%

// Proposal description
const PROPOSAL_DESCRIPTION = `# MIP-R37: Moonriver Progressive Factor Reductions

### **Summary**
This proposal recommends reducing collateral factors on Moonriver markets from 15% to 7.5% as part of the ongoing wind-down of Moonriver lending activity. This will affect xcKSM, MOVR, and FRAX markets respectively.

Chainlink has announced plans to deprecate oracle feeds on Moonriver, materially increasing oracle risk for remaining positions. In advance of this deadline, Anthias Labs has recommended continuing to lower collateral factors toward zero to reduce protocol exposure and encourage orderly position closure.

This proposal represents the next step in that process.

### **Background**
A few weeks ago, the Moonwell community received knowledge that Chainlink is deprecating its price feeds across the Moonriver network. Out of concern for Moonwell's users, we believe the best course of actions is to slowly deprecate the respective markets affected on Moonwell's Moonriver implementation: xcKSM, FRAX, and MOVR.

### **Proposal**

If this proposal is successful, the following markets will have their current collateral factors changed to the proposed collateral factors:

| Market | Current Collateral Factor | Proposed Collateral Factor |
|--------|---------------------------|----------------------------|
| xcKSM  | 15%                       | 7.5%                       |
| MOVR   | 15%                       | 7.5%                       |
| FRAX   | 14%                       | 7.5%                       |

These recommendations were provided by Anthias Labs in their forum post: [Anthias Recommendations](https://forum.moonwell.fi/t/anthias-labs-risk-parameter-recommendations/1759/9)

### **Rationale**

Lowering the collateral factors on Moonriver assets is a necessary and responsible step to ensure a safe wind-down of the affected markets ahead of Chainlink price feed deprecation. Once these feeds go offline, Moonwell would no longer be able to reliably determine asset values on Moonriver.

### **Voting Options**

- **For:** Approve collateral factor changes to the Moonriver markets.
- **Against:** Do not make collateral factor changes to the Moonriver markets.
- **Abstain:** No preference.
`;

function cfPercentToMantissa(newCFPercent: number){
    return EthersBigNumber.from(
        new BigNumber(newCFPercent)
            .div(100)
            .times(new BigNumber('1e18'))
            .toFixed(0)
    )
}

async function main() {
    const contracts = Contracts.moonriver;

    const comptroller = contracts.COMPTROLLER.contract;
    const governor = contracts.GOVERNOR.contract;

    console.log("===========================================");
    console.log("MIP-R37: Moonriver Progressive Factor Reductions");
    console.log("===========================================\n");
    console.log("Summary: Reduce collateral factors from 15% to 7.5%");
    console.log("Markets: xcKSM, MOVR, FRAX\n");

    console.log("Comptroller Address:", contracts.COMPTROLLER.address);
    console.log("Governor Address:", contracts.GOVERNOR.address);
    console.log("");

    const marketsToUpdate = Object.values(contracts.MARKETS).filter(
        m => MARKETS_TO_UPDATE.includes(m.assetTicker as any)
    );

    const proposalData = {
        targets: [] as string[],
        values: [] as number[],
        signatures: [] as string[],
        callDatas: [] as string[],
    };

    const newCFMantissa = cfPercentToMantissa(NEW_COLLATERAL_FACTOR);

    console.log("Actions:");
    console.log("---------");

    for (const market of marketsToUpdate) {
        const iface = comptroller.interface;
        const fullCalldata = iface.encodeFunctionData('_setCollateralFactor', [
            market.mTokenAddress,
            newCFMantissa
        ]);

        const argsOnly = '0x' + fullCalldata.slice(10);

        proposalData.targets.push(contracts.COMPTROLLER.address);
        proposalData.values.push(0);
        proposalData.signatures.push('_setCollateralFactor(address,uint256)');
        proposalData.callDatas.push(argsOnly);

        console.log(`\n${market.assetTicker}:`);
        console.log(`  mToken Address: ${market.mTokenAddress}`);
        console.log(`  New CF: ${NEW_COLLATERAL_FACTOR}% (${newCFMantissa.toString()})`);
        console.log(`  Full Calldata: ${fullCalldata}`);
    }

    console.log("\n\n===========================================");
    console.log("PROPOSAL DATA (for governance submission)");
    console.log("===========================================\n");

    console.log("targets:", JSON.stringify(proposalData.targets, null, 2));
    console.log("\nvalues:", JSON.stringify(proposalData.values, null, 2));
    console.log("\nsignatures:", JSON.stringify(proposalData.signatures, null, 2));
    console.log("\ncallDatas:", JSON.stringify(proposalData.callDatas, null, 2));

    // Generate full propose() calldata
    const proposeCalldata = governor.interface.encodeFunctionData('propose', [
        proposalData.targets,
        proposalData.values,
        proposalData.signatures,
        proposalData.callDatas,
        PROPOSAL_DESCRIPTION
    ]);

    console.log("\n===========================================");
    console.log("FULL PROPOSE CALLDATA (copy for MetaMask)");
    console.log("===========================================");
    console.log(`\nGovernor Address: ${contracts.GOVERNOR.address}`);
    console.log(`Function: propose(address[],uint256[],string[],bytes[],string)`);
    console.log("\n--- START CALLDATA ---");
    console.log(proposeCalldata);
    console.log("--- END CALLDATA ---");

    console.log("\n===========================================");
    console.log("SUMMARY");
    console.log("===========================================");
    console.log(`Total Actions: ${proposalData.targets.length}`);
    console.log(`Markets: xcKSM, MOVR, FRAX`);
    console.log(`New Collateral Factor: ${NEW_COLLATERAL_FACTOR}%`);
    console.log(`New CF Mantissa: ${newCFMantissa.toString()}`);
}

main().catch(console.error);
