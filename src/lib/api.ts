import { createClient } from '@supabase/supabase-js'
import type { Coin, FilterTab, SortField, SortDir, Stats } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const API_BASE = import.meta.env.VITE_API_URL || ''

export async function fetchCoins(
  tab: FilterTab,
  sort: SortField,
  dir: SortDir,
  search: string
): Promise<Coin[]> {
  // Try Express API first, fall back to direct Supabase
  if (API_BASE) {
    try {
      const params = new URLSearchParams({ tab, sort, dir, search })
      const res = await fetch(`${API_BASE}/api/coins?${params}`)
      if (res.ok) {
        const json = await res.json()
        return json.data ?? []
      }
    } catch {
      // Server not available, fall through to direct Supabase
    }
  }

  // Direct Supabase query
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
  return (data ?? []) as Coin[]
}

export async function fetchStats(): Promise<Stats> {
  // Try Express API first
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/coins/stats`)
      if (res.ok) {
        const json = await res.json()
        return json.data
      }
    } catch {
      // fall through
    }
  }

  // Direct Supabase
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

  return {
    total_volume_24h: totalVol,
    gainers,
    losers,
    avg_liquidity: avgLiq,
    total_pairs: coins.length,
  }
}

export async function fetchCoin(pairAddress: string): Promise<Coin | null> {
  const { data } = await supabase
    .from('coins')
    .select('*')
    .eq('pair_address', pairAddress)
    .maybeSingle()
  return data as Coin | null
}

export async function triggerRefresh(): Promise<{ count: number }> {
  // Call the edge function directly
  const url = `${supabaseUrl}/functions/v1/fetch-solana-coins`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  })
  if (!res.ok) throw new Error('Refresh failed')
  return res.json()
}
