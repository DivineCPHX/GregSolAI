import { Request, Response } from 'express'
import { supabase } from '../utils/supabase'
import type { Coin } from '../models/Coin'

type FilterTab = 'trending' | 'new' | 'gainers' | 'losers' | 'high_volume'
type SortField = 'volume_24h' | 'price_change_24h' | 'price_change_1h' | 'market_cap' | 'liquidity_usd' | 'price_change_6h'

export class CoinController {
  static async index(req: Request, res: Response) {
    try {
      const tab: FilterTab = (req.query.tab as FilterTab) || 'trending'
      const sort: SortField = (req.query.sort as SortField) || 'volume_24h'
      const dir: 'asc' | 'desc' = req.query.dir === 'asc' ? 'asc' : 'desc'
      const search: string = (req.query.search as string) || ''

      let query = supabase.from('coins').select('*')

      if (search.trim()) {
        query = query.or(`symbol.ilike.%${search}%,name.ilike.%${search}%`)
      }

      switch (tab) {
        case 'trending':
          query = query.gte('volume_24h', 10000).gte('liquidity_usd', 5000)
          break
        case 'new': {
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          query = query.gte('pair_created_at', oneDayAgo)
          break
        }
        case 'gainers':
          query = query.gte('price_change_24h', 0)
          break
        case 'losers':
          query = query.lte('price_change_24h', 0)
          break
        case 'high_volume':
          query = query.gte('volume_24h', 50000)
          break
      }

      query = query.order(sort, { ascending: dir === 'asc' }).limit(100)

      const { data, error } = await query
      if (error) throw error

      res.json({ data: data ?? [], count: data?.length ?? 0 })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  static async show(req: Request, res: Response) {
    try {
      const { pairAddress } = req.params
      const { data, error } = await supabase
        .from('coins')
        .select('*')
        .eq('pair_address', pairAddress)
        .maybeSingle()

      if (error) throw error
      if (!data) return res.status(404).json({ error: 'Coin not found' })

      res.json({ data })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }

  static async stats(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('coins')
        .select('volume_24h, price_change_24h, liquidity_usd')
        .gte('volume_24h', 1000)

      if (error) throw error

      const coins = data ?? []
      const totalVol = coins.reduce((s, c) => s + Number(c.volume_24h), 0)
      const gainers = coins.filter(c => Number(c.price_change_24h) > 0).length
      const losers = coins.filter(c => Number(c.price_change_24h) < 0).length
      const avgLiq = coins.length > 0 ? coins.reduce((s, c) => s + Number(c.liquidity_usd), 0) / coins.length : 0

      res.json({
        data: {
          total_volume_24h: totalVol,
          gainers,
          losers,
          avg_liquidity: avgLiq,
          total_pairs: coins.length,
        },
      })
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' })
    }
  }
}
