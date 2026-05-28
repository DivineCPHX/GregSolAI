import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
}

interface DexScreenerToken {
  address: string
  name: string
  symbol: string
}

interface DexScreenerPair {
  chainId: string
  dexId: string
  pairAddress: string
  baseToken: DexScreenerToken
  quoteToken: DexScreenerToken
  priceUsd: string
  priceNative: string
  txns: {
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: { h24: number; h6: number; h1: number }
  priceChange: { h1: number; h6: number; h24: number }
  liquidity: { usd: number; base: number; quote: number }
  fdv: number
  marketCap: number
  pairCreatedAt: number
  info?: {
    imageUrl?: string
    websites?: { url: string }[]
    socials?: { type: string; url: string }[]
  }
}

const KNOWN_TOKENS = [
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', // WIF
  '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', // POPCAT
  'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4', // MYRO
  'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',  // BOME
]

const SEARCH_QUERIES = ['BONK', 'WIF', 'POPCAT', 'MYRO', 'BOME', 'SLERF', 'PONKE', 'MEW', 'BRETT']

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const allPairs: DexScreenerPair[] = []
    const seen = new Set<string>()

    // 1. Fetch top boosted Solana tokens from DexScreener
    try {
      const trendingRes = await fetch('https://api.dexscreener.com/token-boosts/top/v1', {
        headers: { 'User-Agent': 'Greg-Bot/1.0' },
      })
      if (trendingRes.ok) {
        const trendingData = await trendingRes.json()
        const solanaBoosted: string[] = (trendingData || [])
          .filter((b: { chainId: string }) => b.chainId === 'solana')
          .map((b: { tokenAddress: string }) => b.tokenAddress)
          .slice(0, 50)

        if (solanaBoosted.length > 0) {
          const chunks = chunkArray(solanaBoosted, 30)
          for (const chunk of chunks) {
            const pairsRes = await fetch(
              `https://api.dexscreener.com/tokens/v1/solana/${chunk.join(',')}`,
              { headers: { 'User-Agent': 'Greg-Bot/1.0' } }
            )
            if (pairsRes.ok) {
              const pairsData: DexScreenerPair[] = await pairsRes.json()
              for (const pair of (pairsData || [])) {
                if (pair.chainId === 'solana' && !seen.has(pair.pairAddress)) {
                  seen.add(pair.pairAddress)
                  allPairs.push(pair)
                }
              }
            }
          }
        }
      }
    } catch (_e) {
      // skip boosted fetch failure
    }

    // 2. Fetch known memecoin token addresses
    for (const addr of KNOWN_TOKENS) {
      try {
        const res = await fetch(
          `https://api.dexscreener.com/tokens/v1/solana/${addr}`,
          { headers: { 'User-Agent': 'Greg-Bot/1.0' } }
        )
        if (res.ok) {
          const data: DexScreenerPair[] = await res.json()
          for (const pair of (data || [])) {
            if (pair.chainId === 'solana' && !seen.has(pair.pairAddress)) {
              seen.add(pair.pairAddress)
              allPairs.push(pair)
            }
          }
        }
      } catch (_e) {
        // skip individual token fetch failure
      }
    }

    // 3. Search by popular memecoin symbols
    for (const q of SEARCH_QUERIES.slice(0, 5)) {
      try {
        const res = await fetch(
          `https://api.dexscreener.com/latest/dex/search?q=${q}`,
          { headers: { 'User-Agent': 'Greg-Bot/1.0' } }
        )
        if (res.ok) {
          const data = await res.json()
          const pairs: DexScreenerPair[] = data?.pairs || []
          for (const pair of pairs) {
            if (pair.chainId === 'solana' && !seen.has(pair.pairAddress)) {
              seen.add(pair.pairAddress)
              allPairs.push(pair)
            }
          }
        }
      } catch (_e) {
        // skip search failure
      }
    }

    if (allPairs.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No pairs fetched from DexScreener' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Filter: only pairs with meaningful liquidity and volume
    const filtered = allPairs
      .filter(p =>
        p.liquidity?.usd > 1000 &&
        p.volume?.h24 > 500 &&
        p.priceUsd &&
        parseFloat(p.priceUsd) > 0
      )
      .slice(0, 200)

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

    return new Response(
      JSON.stringify({ success: true, count: rows.length, timestamp: new Date().toISOString() }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
