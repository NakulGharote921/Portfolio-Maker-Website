import { samplePortfolios } from '../data/samplePortfolios.js'

async function seed() {
  console.log('Local mock seeding is no longer part of the Supabase rollout.')
  console.log('Use the Supabase dashboard, SQL editor, or app UI to add portfolios instead.')
  console.log(`Sample portfolio templates available: ${samplePortfolios.length}`)
}

seed().catch(console.error)
