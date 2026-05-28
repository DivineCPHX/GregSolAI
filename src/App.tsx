import { useState, useEffect, useCallback, useRef } from 'react'
import { Zap, Bell } from 'lucide-react'
import { fetchCoins, fetchStats, triggerRefresh, supabase } from './lib/api'
import type { Coin, FilterTab, SortField, SortDir, Stats } from './lib/types'
import GregLogo from './components/GregLogo'
import FilterTabs from './components/FilterTabs'
import SearchBar from './components/SearchBar'
import RefreshButton from './components/RefreshButton'
import StatBar from './components/StatBar'
import CoinRow from './components/CoinRow'
import CoinDetail from './components/CoinDetail'
import SortableHeader from './components/SortableHeader'

const AUTO_REFRESH_MS = 30_000

export default function App() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [tab, setTab] = useState<FilterTab>('trending')
  const [sortField, setSortField] = useState<SortField>('volume_24h')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [search, setSearch] = useState('')
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())
  const [lastRefresh, setLastRefresh] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [coinData, statsData] = await Promise.all([
        fetchCoins(tab, sortField, sortDir, search),
        fetchStats(),
      ])
      setCoins(coinData)
      setStats(statsData)
      if (coinData.length > 0) setLastRefresh(new Date().toISOString())
    } catch (err) {
      console.error('Load failed:', err)
    } finally {
      setLoading(false)
    }
  }, [tab, sortField, sortDir, search])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await triggerRefresh()
      await new Promise(r => setTimeout(r, 3000))
      await load()
    } catch {
      await load()
    } finally {
      setRefreshing(false)
    }
  }, [load])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(load, AUTO_REFRESH_MS)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [load])

  useEffect(() => {
    const channel = supabase
      .channel('coins-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coins' }, () => {
        load()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const toggleWatchlist = (coin: Coin) => {
    setWatchlist(prev => {
      const next = new Set(prev)
      if (next.has(coin.pair_address)) next.delete(coin.pair_address)
      else next.add(coin.pair_address)
      return next
    })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GregLogo size={36} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight">GREG</h1>
                <span className="text-xs bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">AI</span>
              </div>
              <p className="text-slate-500 text-xs leading-none">Degen Solana Memecoin Scanner</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
              <span className="font-mono">{coins.length} pairs live</span>
            </div>
            <button className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors relative">
              <Bell size={16} />
              {watchlist.size > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full" />}
            </button>
            <RefreshButton lastRefresh={lastRefresh} loading={refreshing} onRefresh={handleRefresh} />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 py-6 space-y-5">
        {/* Greg's Callout */}
        <div className="bg-gradient-to-r from-cyan-500/10 via-slate-800/30 to-emerald-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
          <Zap size={18} className="text-cyan-400 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold text-white">Yo, it's Greg.</span>
            <span className="text-slate-400 ml-2 text-sm">
              I scan real Solana memecoin pairs every 30 seconds from DexScreener.
              I sort them, rate them, and tell you which ones are sending.
              <span className="text-yellow-400 ml-1">NFA. DYOR. Don't blame me when it rugs.</span>
            </span>
          </div>
        </div>

        {/* Stats */}
        <StatBar stats={stats} loading={loading && !stats} />

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <FilterTabs active={tab} onChange={setTab} />
          <div className="w-full sm:w-60">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="py-2.5 pl-4 pr-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-10">#</th>
                  <th className="py-2.5 px-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Token</th>
                  <th className="py-2.5 px-2 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Price</th>
                  <SortableHeader field="price_change_1h" label="1H" active={sortField} dir={sortDir} onSort={handleSort} />
                  <SortableHeader field="price_change_6h" label="6H" active={sortField} dir={sortDir} onSort={handleSort} />
                  <SortableHeader field="price_change_24h" label="24H" active={sortField} dir={sortDir} onSort={handleSort} />
                  <SortableHeader field="volume_24h" label="Vol 24H" active={sortField} dir={sortDir} onSort={handleSort} />
                  <SortableHeader field="liquidity_usd" label="Liquidity" active={sortField} dir={sortDir} onSort={handleSort} />
                  <SortableHeader field="market_cap" label="MCap" active={sortField} dir={sortDir} onSort={handleSort} />
                  <th className="py-2.5 px-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Buys/Sells</th>
                  <th className="py-2.5 px-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Age</th>
                  <th className="py-2.5 px-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {loading && coins.length === 0 ? (
                  Array.from({ length: 12 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800">
                      {Array.from({ length: 12 }).map((_, j) => (
                        <td key={j} className="py-3 px-2">
                          <div className="h-4 bg-slate-800 rounded animate-pulse" style={{ width: `${40 + Math.random() * 50}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : coins.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-16 text-center text-slate-500">
                      <div className="text-4xl mb-3">🦗</div>
                      <div className="font-semibold text-slate-400">Greg found nothing.</div>
                      <div className="text-sm mt-1">Try refreshing or switching tabs.</div>
                    </td>
                  </tr>
                ) : (
                  coins.map((coin, i) => (
                    <CoinRow
                      key={coin.id}
                      coin={coin}
                      rank={i + 1}
                      onSelect={setSelectedCoin}
                      watchlisted={watchlist.has(coin.pair_address)}
                      onWatchlist={toggleWatchlist}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {coins.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>{coins.length} pairs shown</span>
              <span>Auto-refreshes every 30s · Data from DexScreener</span>
            </div>
          )}
        </div>
      </main>

      {selectedCoin && (
        <CoinDetail
          coin={selectedCoin}
          onClose={() => setSelectedCoin(null)}
          watchlisted={watchlist.has(selectedCoin.pair_address)}
          onWatchlist={toggleWatchlist}
        />
      )}
    </div>
  )
}
