import { Request, Response } from 'express'
import { DexScreenerService } from '../services/DexScreenerService'
import { supabase } from '../utils/supabase'
import type { DexScreenerPair } from '../models/Coin'

const KNOWN_TOKENS = [
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', // POPCAT
  'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4', // MYRO
  'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',  // BOME
]

const SEARCH_QUERIES = ['BONK', 'WIF', 'POPCAT', 'MYRO', 'BOME', 'SLERF', 'PONKE', 'MEW', 'BRETT', 'SOL']

export class RefreshController {
  static async refresh(req: Request, res: Response) {
    try {
      const allPairs: DexScreenerPair[] = []
      const seen = new Set<string>()

      // 1. Fetch top boosted Solana tokens
      const boosted = await DexScreenerService.getTopBoosted(50)
      for (const pair of boosted) {
        if (!seen.has(pair.pairAddress)) {
          seen.add(pair.pairAddress)
          allPairs.push(pair)
        }
      }

      // 2. Fetch known memecoin token addresses
      const known = await DexScreenerService.getTokens(KNOWN_TOKENS)
      for (const pair of known) {
        if (!seen.has(pair.pairAddress)) {
          seen.add(pair.pairAddress)
          allPairs.push(pair)
        }
      }

      // 3. Search by popular symbols
      for (const q of SEARCH_QUERIES.slice(0, 5)) {
        const results = await DexScreenerService.searchPairs(q, 20)
        for (const pair of results) {
          if (!seen.has(pair.pairAddress)) {
            seen.add(pair.pairAddress)
            allPairs.push(pair)
          }
        }
      }

      // Filter: meaningful liquidity and volume
      const filtered = allPairs
        .filter(p =>
          p.liquidity?.usd > 1000 &&
          p.volume?.h24 > 500 &&
          p.priceUsd &&
          parseFloat(p.priceUsd) > 0
        )
        .slice(0, 200)

      if (!filtered.length) {
        return res.json({ success: true, count: 0, message: 'No pairs fetched' })
      }

      // Upsert to DB
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

      const { error } = await supabase
        .from('coins')
        .upsert(rows, { onConflict: 'pair_address' })

      if (error) throw error

      res.json({
        success: true,
        count: rows.length,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }
}
