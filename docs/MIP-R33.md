## MIP-R33: Moonriver Markets Reward and Collateral Factor Changes

### **Summary**
This proposal disables reward emissions to both borrowers and suppliers on Moonriver markets that are currently operating in withdraw/repay-only mode. These markets no longer accept new supply or borrow activity, and continuing emissions provides no meaningful benefit. The following markets will be affected: xcKSM, MOVR, and FRAX.

Reward emissions will be turned off until further notice. The Moonwell Foundation will separately handle any reward shortfall through a one-time treasury top-up.

Additionally, this proposal includes initial collateral factor reductions on Moonriver (xcKSM 50%, MOVR 50%, FRAX 40%) as part of a staged risk-off process. These adjustments help ensure a controlled wind-down of remaining positions while giving users sufficient time to repay.

### **Background**

 Moonriver markets have been set to withdraw/repay-only mode due to oracle deprecation, risk mitigation, or migration preparation. In this restricted state:

- Users cannot open new supply positions
- Users cannot initiate new borrows
- Only withdrawals and loan repayments are enabled
- No active lending or borrowing activity is taking place

Despite this, rewards have continued emitting, even though incentives no longer drive usage or serve their intended purpose. Emissions on inactive markets are inefficient and create administrative overhead.

Again, the following markets will be affected:

1. xcKSM
2. MOVR
3. FRAX

**Source:**
[Chainlink Documentation — Deprecation of Moonriver Data Feeds](https://docs.chain.link/data-feeds/deprecating-feeds?page=1&testnetPage=1#moonriver-mainnet)

### **Proposal**

The proposal enacts the following changes on **Moonriver**:

### **1. Turn Off Reward Emissions**
All reward emissions for Moonriver markets currently in withdraw/repay-only mode will be set to 0.

This applies to all affected markets where supply/borrow is disabled and only unwinding is possible.

### **2. Collateral Factor Changes**

This proposal also introduces initial collateral factor (CF) reductions for Moonriver assets. These changes are designed to support a safe wind-down of Moonriver markets.

**Immediate CF changes (effective upon execution):**
- xcKSM: 50%
- MOVR: 50%
- FRAX: 40%

These represent the first step in a staged reduction process that will continue over subsequent proposals.

**Planned future reductions:**
- 50% → 25%
- 25% → 0%

Each reduction stage will include some notice in advance to ensure that users have sufficient time to repay their positions.

### **Rationale**
Reward emissions on markets that are restricted to withdraw/repay-only mode no longer serve their intended purpose, as users cannot supply or borrow in ways that incentives were designed to encourage. Continuing to emit in this state provides no  benefit to the protocol, creates unnecessary treasury expenditure, and generates confusion within the user interface by displaying incentives on inactive markets. Disabling emissions is therefore a straightforward, action that preserves treasury resources, and simplifies contributor operations.

### **Voting Options**

- Yes — Disable reward emissions for Moonriver markets currently in withdraw/repay-only mode.
- No — Maintain current reward emissions on these inactive markets.
- Abstain — No preference.
