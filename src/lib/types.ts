export interface Coin {
  id: string
  pair_address: string
  token_address: string
  symbol: string
  name: string
  dex_id: string
  price_usd: number
  price_sol: number
  price_change_1h: number
  price_change_6h: number
  price_change_24h: number
  volume_24h: number
  liquidity_usd: number
  market_cap: number
  fdv: number
  txns_buys_24h: number
  txns_sells_24h: number
  image_url: string
  pair_created_at: string | null
  last_fetched_at: string | null
  created_at: string | null
}

export type FilterTab = 'trending' | 'new' | 'gainers' | 'losers' | 'high_volume'
export type SortField = 'volume_24h' | 'price_change_24h' | 'price_change_1h' | 'market_cap' | 'liquidity_usd' | 'price_change_6h'
export type SortDir = 'asc' | 'desc'

export interface Stats {
  total_volume_24h: number
  gainers: number
  losers: number
  avg_liquidity: number
  total_pairs: number
}

export interface GregRating {
  label: string
  note: string
  color: string
}
