# MIP-R38: Moonriver Complete Deprecation

### **Summary**
This proposal recommends reducing collateral factors on Moonriver markets from 7.5% to 0% as part of the ongoing wind-down of Moonriver lending activity. This will affect xcKSM, MOVR, and FRAX markets respectively.

Chainlink has announced plans to deprecate oracle feeds on Moonriver, materially increasing oracle risk for remaining positions. In advance of this deadline, Anthias Labs has recommended continuing to lower collateral factors toward zero to reduce protocol exposure and encourage orderly position closure.

This proposal represents the next step in that process.

### **Background**
Over a month ago, the Moonwell community received knowledge that Chainlink is deprecating its price feeds across the Moonriver network. Out of concern for Moonwell's users, we believe the best course of actions is to slowly deprecate the respective markets affected on Moonwell's Moonriver implementation: xcKSM, FRAX, and MOVR.

### **Proposal**

If this proposal is successful, the following markets will have their current collateral factors changed to the proposed collateral factors:

| Market | Current Collateral Factor | Proposed Collateral Factor |
|--------|---------------------------|----------------------------|
| xcKSM  | 7.5%                      | 0%                         |
| MOVR   | 7.5%                      | 0%                         |
| FRAX   | 7.5%                      | 0%                         |

These recommendations were provided by Anthias Labs in their forum post: [Anthias Recommendations](https://forum.moonwell.fi/t/anthias-labs-risk-parameter-recommendations/1759/9)

### **Rationale**

Lowering the collateral factors on Moonriver assets is a necessary and responsible step to ensure a safe wind-down of the affected markets ahead of Chainlink price feed deprecation. Once these feeds go offline, Moonwell would no longer be able to reliably determine asset values on Moonriver. This completes the slow wind down of the Moonriver markets.

### **Voting Options**

- **For:** Approve collateral factor changes to the Moonriver markets.
- **Against:** Do not make collateral factor changes to the Moonriver markets.
- **Abstain:** No preference.
