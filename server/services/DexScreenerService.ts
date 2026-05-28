import axios from 'axios'
import { config } from '../config'
import type { DexScreenerPair } from '../models/Coin'

const client = axios.create({
  baseURL: config.dexScreener.baseUrl,
  timeout: config.dexScreener.timeout,
  headers: { 'User-Agent': 'Greg-Bot/1.0' },
})

export class DexScreenerService {
  static async searchPairs(query: string, limit = 30): Promise<DexScreenerPair[]> {
    try {
      const { data } = await client.get<{ pairs: DexScreenerPair[] | null }>('/latest/dex/search', {
        params: { q: query },
      })
      return (data.pairs || [])
        .filter(p => p.chainId === 'solana')
        .slice(0, limit)
    } catch (err) {
      console.error('DexScreener search failed:', err)
      return []
    }
  }

  static async getTokens(tokenAddresses: string[]): Promise<DexScreenerPair[]> {
    if (!tokenAddresses.length) return []
    const all: DexScreenerPair[] = []
    const seen = new Set<string>()

    const chunks = this.chunkArray(tokenAddresses, 30)
    for (const chunk of chunks) {
      try {
        const { data } = await client.get<DexScreenerPair[]>(`/tokens/v1/solana/${chunk.join(',')}`)
        for (const pair of data || []) {
          if (pair.chainId === 'solana' && !seen.has(pair.pairAddress)) {
            seen.add(pair.pairAddress)
            all.push(pair)
          }
        }
      } catch (err) {
        console.error('DexScreener token fetch failed:', err)
      }
    }
    return all
  }

  static async getTopBoosted(limit = 50): Promise<DexScreenerPair[]> {
    try {
      const { data } = await client.get<any>('/token-boosts/top/v1')
      const solanaBoosted = (data || [])
        .filter((b: any) => b.chainId === 'solana')
        .map((b: any) => b.tokenAddress)
        .slice(0, limit)

      if (!solanaBoosted.length) return []
      return this.getTokens(solanaBoosted)
    } catch (err) {
      console.error('DexScreener boosted fetch failed:', err)
      return []
    }
  }

  private static chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size))
    }
    return chunks
  }
}
