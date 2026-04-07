/* eslint-disable no-console */
import { createPortfolio } from '../services/portfolioService.js'
import { samplePortfolios } from '../data/samplePortfolios.js'

async function seed() {
  console.log('Seeding 10 sample portfolios...')
  
  for (const portfolio of samplePortfolios) {
    try {
      // Skip if already exists (simple check by name)
      const existing = await (await import('../services/portfolioService.js')).getPortfolios(portfolio.name)
        .then(data => data.some(p => p.name === portfolio.name))
      if (existing) {
        console.log(`Skipping ${portfolio.name} (already exists)`)
        continue
      }
      
      await createPortfolio(portfolio)
      console.log(`Created: ${portfolio.title}`)
    } catch (error) {
      console.error(`Failed to create ${portfolio.name}:`, error)
    }
  }
  
  console.log('Seeding complete. Refresh your app to see portfolios on Home page.')
}

// Run seed
seed().catch(console.error)

