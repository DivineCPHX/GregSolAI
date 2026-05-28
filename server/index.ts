import express from 'express'
import cors from 'cors'
import { config } from './config'
import { corsMiddleware } from './middleware/cors'
import apiRoutes from './routes/api'
import cron from 'node-cron'
import { DexScreenerService } from './services/DexScreenerService'
import { supabase } from './utils/supabase'
import type { DexScreenerPair } from './models/Coin'

const app = express()

app.use(cors())
app.use(express.json())
app.use(corsMiddleware)

// API routes — prefixed like Laravel's Route::prefix('api')
app.use('/api', apiRoutes)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Cron: auto-refresh every 30 seconds — like Laravel's Task Scheduler
const KNOWN_TOKENS = [
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
  'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
  'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
]

async function scheduledRefresh() {
  console.log('[Greg Cron] Starting scheduled refresh...')
  try {
    const allPairs: DexScreenerPair[] = []
    const seen = new Set<string>()

    const boosted = await DexScreenerService.getTopBoosted(50)
    for (const p of boosted) { if (!seen.has(p.pairAddress)) { seen.add(p.pairAddress); allPairs.push(p) } }

    const known = await DexScreenerService.getTokens(KNOWN_TOKENS)
    for (const p of known) { if (!seen.has(p.pairAddress)) { seen.add(p.pairAddress); allPairs.push(p) } }

    const filtered = allPairs
      .filter(p => p.liquidity?.usd > 1000 && p.volume?.h24 > 500 && p.priceUsd && parseFloat(p.priceUsd) > 0)
      .slice(0, 200)

    if (!filtered.length) { console.log('[Greg Cron] No pairs found'); return }

    const rows = filtered.map(pair => ({
      pair_address: pair.pairAddress,
      token_address: pair.baseToken.address,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      dex_id: pair.dexId,
      price_usd: parseFloat(pair.priceUsd) || 0,
      price_sol: parseFloat(pair.priceNative) || 0,
      price_change_1h: pair.priceChange?.h1 || 0,
      price_change_6h: pair.priceChange?.h6 || 0,
      price_change_24h: pair.priceChange?.h24 || 0,
      volume_24h: pair.volume?.h24 || 0,
      liquidity_usd: pair.liquidity?.usd || 0,
      market_cap: pair.marketCap || 0,
      fdv: pair.fdv || 0,
      txns_buys_24h: pair.txns?.h24?.buys || 0,
      txns_sells_24h: pair.txns?.h24?.sells || 0,
      image_url: pair.info?.imageUrl || '',
      pair_created_at: pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : null,
      last_fetched_at: new Date().toISOString(),
    }))

    const { error } = await supabase.from('coins').upsert(rows, { onConflict: 'pair_address' })
    if (error) throw error

    console.log(`[Greg Cron] Upserted ${rows.length} pairs`)
  } catch (err) {
    console.error('[Greg Cron] Error:', err)
  }
}

// Every 30 seconds
cron.schedule('*/30 * * * * *', scheduledRefresh)

// Initial fetch on boot
setTimeout(scheduledRefresh, 3000)

app.listen(config.port, () => {
  console.log(`[Greg] Server running on port ${config.port}`)
  console.log(`[Greg] Cron scheduler active — refreshing every 30s`)
})

export default app
