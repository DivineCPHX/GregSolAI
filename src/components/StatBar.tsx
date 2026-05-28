import type { Stats } from '../lib/types'
import { formatVolume } from '../lib/format'
import { TrendingUp, TrendingDown, Activity, Droplets } from 'lucide-react'

interface Props {
  stats: Stats | null
  loading: boolean
}

export default function StatBar({ stats, loading }: Props) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 animate-pulse">
            <div className="h-3 bg-slate-700 rounded w-20 mb-3" />
            <div className="h-6 bg-slate-700 rounded w-24" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
          <Activity size={12} className="text-cyan-400" /> Total Volume 24H
        </div>
        <div className="text-white font-mono font-bold text-xl">{formatVolume(stats.total_volume_24h)}</div>
        <div className="text-slate-500 text-xs mt-0.5">{stats.total_pairs} pairs tracked</div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
          <TrendingUp size={12} className="text-emerald-400" /> Gainers
        </div>
        <div className="text-emerald-400 font-mono font-bold text-xl">{stats.gainers}</div>
        <div className="text-slate-500 text-xs mt-0.5">coins up 24h</div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
          <TrendingDown size={12} className="text-red-400" /> Losers
        </div>
        <div className="text-red-400 font-mono font-bold text-xl">{stats.losers}</div>
        <div className="text-slate-500 text-xs mt-0.5">coins down 24h</div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider mb-2">
          <Droplets size={12} className="text-cyan-400" /> Avg Liquidity
        </div>
        <div className="text-white font-mono font-bold text-xl">{formatVolume(stats.avg_liquidity)}</div>
        <div className="text-slate-500 text-xs mt-0.5">per pair</div>
      </div>
    </div>
  )
}
