# MIP-R35: Moonriver Collateral Factor Changes

### **Summary**
This proposal suggests changing the collateral factors on the Moonriver markets further to continue the current market wind-down. For those unfamiliar, Moonriver price feeds will be deprecated in early January, and as a result, Moonwell is winding down these markets to prevent a possible issue in the future. Recently, collateral factor, reward variables, and supply and borrow caps were already modified to start the wind down process, this is the next reasonable conclusion.

The following markets will have their collateral factors modified: xcKSM, MOVR, and FRAX. This proposal details the specific percentage changes to these variables.

### **Background**
A few weeks ago, the Moonwell community received knowledge that Chainlink is deprecating its price feeds across the Moonriver network. Out of concern for Moonwell's users, we believe the best course of actions is to slowly deprecate the respective markets affected on Moonwell's Moonriver implementation: xcKSM, FRAX, and MOVR.

### **Proposal**

If this proposal is successful, the following markets will have their current collateral factors changed to the proposed collateral factors:

| Market | Current Collateral Factor | Proposed Collateral Factor |
|--------|----------------------------|-----------------------------|
| xcKSM  | 50%                        | 25%                         |
| MOVR   | 50%                        | 25%                         |
| FRAX   | 40%                        | 25%                         |

These recommendations were provided by Anthias Labs in their forum post: [Moonriver Chain Sunset](https://forum.moonwell.fi/t/moonriver-chain-sunset/2042)

### **Rationale**

Lowering the collateral factors on Moonriver assets is a necessary and responsible step to ensure a safe wind-down of the affected markets ahead of Chainlink's price feed deprecation. Once these feeds go offline, Moonwell would no longer be able to reliably determine asset values on Moonriver, creating a material risk of under-collateralized borrowing, inaccurate liquidations, and potential bad debt.

### **Voting Options**

- **For:** Approve collateral factor changes to the Moonriver markets.
- **Against:** Do not make collateral factor changes to the Moonriver markets.
- **Abstain:** No preference.
