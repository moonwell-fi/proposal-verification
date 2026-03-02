import {ethers} from 'ethers'
import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData"
import {RPC_URL, UNDERLYING_TOKENS, DIRECT_PRICES} from "./vars"
import * as fs from 'fs'
import * as path from 'path'

async function main() {
    const contracts = Contracts.moonriver
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

    console.log('\n===========================================')
    console.log('MIP-R39: Set Direct Prices on Moonriver Oracle')
    console.log('===========================================\n')

    console.log('Governor Address:', contracts.GOVERNOR.address)
    console.log('Oracle Address:', '0x892bE716Dcf0A6199677F355f45ba8CC123BAF60')
    console.log()

    console.log('Generating proposal data...\n')
    const proposalData = await generateProposalData(contracts, provider)

    // Read the full proposal description from the markdown file
    const markdownPath = path.join(__dirname, '../../../docs/MIP-R39.md')
    const description = fs.readFileSync(markdownPath, 'utf-8')

    console.log('Loaded full markdown proposal from docs/MIP-R39.md')
    console.log(`Description length: ${description.length} characters\n`)

    console.log('=== PROPOSAL DESCRIPTION ===\n')
    console.log(description)
    console.log('\n=== END DESCRIPTION ===\n')

    console.log('=== PROPOSAL DATA ===\n')
    console.log(JSON.stringify(proposalData, null, 2))
    console.log('\n=== SUMMARY ===')
    console.log(`Total actions: ${proposalData.targets.length}`)
    console.log('\nActions:')
    const marketOrder = ['USDC.multi', 'USDT.multi', 'FRAX', 'ETH.multi', 'BTC.multi', 'xcKSM']
    proposalData.signatures.forEach((sig, i) => {
        const ticker = marketOrder[i] || 'MOVR (setFeed)'
        const price = DIRECT_PRICES[ticker]
        const priceUSD = price ? ethers.utils.formatUnits(price, 18) : 'N/A'
        console.log(`  ${i + 1}. ${sig} - ${ticker} @ $${priceUSD}`)
    })

    // Encode the propose function call
    console.log('\n===========================================')
    console.log('ENCODED PROPOSE CALLDATA')
    console.log('===========================================\n')

    const governor = contracts.GOVERNOR.contract.connect(provider)
    const proposeCalldata = await governor.populateTransaction.propose(
        proposalData.targets,
        proposalData.values,
        proposalData.signatures,
        proposalData.callDatas,
        description
    )

    console.log('To:', contracts.GOVERNOR.address)
    console.log('Data:', proposeCalldata.data)
    console.log('\nCalldata Length:', proposeCalldata.data!.length, 'characters')
    console.log('\nYou can submit this transaction to the Governor contract at:')
    console.log('https://moonriver.moonscan.io/address/' + contracts.GOVERNOR.address + '#writeContract')
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
