import {ethers} from 'ethers'
import {Contracts} from '@moonwell-fi/moonwell.js'
import {generateProposalData} from "./generateProposalData"
import {RPC_URL, STARTING_COLLATERAL_FACTORS, COLLATERAL_FACTOR_CHANGES} from "./vars"
import * as fs from 'fs'
import * as path from 'path'

async function main() {
    const contracts = Contracts.moonriver
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

    console.log('\n===========================================')
    console.log('MIP-R37: Moonriver Collateral Factor Changes')
    console.log('===========================================\n')

    console.log('Governor Address:', contracts.GOVERNOR.address)
    console.log('Expected:', '0x2BE2e230e89c59c8E20E633C524AD2De246e7370')
    console.log('Match:', contracts.GOVERNOR.address === '0x2BE2e230e89c59c8E20E633C524AD2De246e7370' ? '✅' : '❌')
    console.log()

    console.log('Generating proposal data...\n')
    const proposalData = await generateProposalData(contracts, provider)

    // Read the full proposal description from the markdown file
    const markdownPath = path.join(__dirname, '../../../docs/MIP-R37.md')
    const description = fs.readFileSync(markdownPath, 'utf-8')

    console.log('✅ Loaded full markdown proposal from docs/MIP-R37.md')
    console.log(`Description length: ${description.length} characters\n`)

    console.log('=== PROPOSAL DESCRIPTION ===\n')
    console.log(description)
    console.log('\n=== END DESCRIPTION ===\n')

    console.log('=== PROPOSAL DATA ===\n')
    console.log(JSON.stringify(proposalData, null, 2))
    console.log('\n=== SUMMARY ===')
    console.log(`Total actions: ${proposalData.targets.length}`)
    console.log(`Target (Comptroller): ${proposalData.targets[0]}`)
    console.log('\nActions:')
    const cfMarkets = ['xcKSM', 'MOVR', 'FRAX']
    proposalData.signatures.forEach((sig, i) => {
        console.log(`  ${i + 1}. ${sig} - ${cfMarkets[i]} CF`)
    })
    console.log('\nCollateral Factor Changes:')
    for (const market of cfMarkets) {
        const oldCF = STARTING_COLLATERAL_FACTORS[market]
        const newCF = COLLATERAL_FACTOR_CHANGES[market]
        console.log(`  - ${market}: ${oldCF}% → ${newCF}%`)
    }

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
