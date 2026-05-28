import { z } from 'zod'

export const CoinSchema = z.object({
  id: z.string().uuid().optional(),
  pair_address: z.string().min(1),
  token_address: z.string().min(1),
  symbol: z.string().min(1),
  name: z.string().min(1),
  dex_id: z.string().min(1),
  price_usd: z.number().nonnegative().default(0),
  price_sol: z.number().nonnegative().default(0),
  price_change_1h: z.number().default(0),
  price_change_6h: z.number().default(0),
  price_change_24h: z.number().default(0),
  volume_24h: z.number().nonnegative().default(0),
  liquidity_usd: z.number().nonnegative().default(0),
  market_cap: z.number().nonnegative().default(0),
  fdv: z.number().nonnegative().default(0),
  txns_buys_24h: z.number().nonnegative().default(0),
  txns_sells_24h: z.number().nonnegative().default(0),
  image_url: z.string().optional().default(''),
  pair_created_at: z.string().datetime().nullable().optional(),
  last_fetched_at: z.string().datetime().nullable().optional(),
  created_at: z.string().datetime().optional(),
})

export type Coin = z.infer<typeof CoinSchema>

export interface CoinResponse extends Coin {
  buy_ratio: number
  pair_age_text: string
}

export interface DexScreenerToken {
  address: string
  name: string
  symbol: string
}

export interface DexScreenerPair {
  chainId: string
  dexId: string
  pairAddress: string
  baseToken: DexScreenerToken
  quoteToken: DexScreenerToken
  priceUsd: string
  priceNative: string
  txns: { h1: { buys: number; sells: number }; h6: { buys: number; sells: number }; h24: { buys: number; sells: number } }
  volume: { h24: number; h6: number; h1: number }
  priceChange: { h1: number; h6: number; h24: number }
  liquidity: { usd: number; base: number; quote: number }
  fdv: number
  marketCap: number
  pairCreatedAt: number
  info?: { imageUrl?: string; websites?: { url: string }[]; socials?: { type: string; url: string }[] }
}
