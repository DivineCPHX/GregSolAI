import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '5000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  dexScreener: {
    baseUrl: process.env.DEX_SCREENER_API || 'https://api.dexscreener.com',
    timeout: 10000,
  },
  coin: {
    refetchIntervalMs: 30000,
    minLiquidity: 1000,
    minVolume24h: 500,
    resultsPerPage: 100,
  },
}
