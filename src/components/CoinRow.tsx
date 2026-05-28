import { Star, ExternalLink, Droplets } from 'lucide-react'
import type { Coin } from '../lib/types'
import { formatUSD, formatVolume, pairAge } from '../lib/format'
import PriceChangeBadge from './PriceChangeBadge'

interface Props {
  coin: Coin
  rank: number
  onSelect: (coin: Coin) => void
  watchlisted: boolean
  onWatchlist: (coin: Coin) => void
}

export default function CoinRow({ coin, rank, onSelect, watchlisted, onWatchlist }: Props) {
  const totalTxns = coin.txns_buys_24h + coin.txns_sells_24h
  const buyRatio = totalTxns > 0 ? (coin.txns_buys_24h / totalTxns) * 100 : 50

  return (
    <tr
      className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors cursor-pointer group"
      onClick={() => onSelect(coin)}
    >
      <td className="py-3 pl-4 pr-2 text-slate-500 text-sm font-mono w-10">{rank}</td>

      <td className="py-3 px-2">
        <div className="flex items-center gap-3">
          {coin.image_url ? (
            <img src={coin.image_url} alt={coin.symbol} className="w-8 h-8 rounded-full bg-slate-700 shrink-0 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">
              {coin.symbol.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-semibold text-white text-sm leading-tight">{coin.symbol}</div>
            <div className="text-slate-500 text-xs truncate max-w-[120px]">{coin.name}</div>
          </div>
        </div>
      </td>

      <td className="py-3 px-2 text-right">
        <div className="font-mono text-white text-sm">{formatUSD(coin.price_usd)}</div>
        <div className="text-slate-500 text-xs font-mono">{coin.price_sol.toFixed(6)} SOL</div>
      </td>

      <td className="py-3 px-2 text-right"><PriceChangeBadge value={coin.price_change_1h} size="sm" /></td>
      <td className="py-3 px-2 text-right"><PriceChangeBadge value={coin.price_change_6h} size="sm" /></td>
      <td className="py-3 px-2 text-right"><PriceChangeBadge value={coin.price_change_24h} size="sm" /></td>

      <td className="py-3 px-2 text-right font-mono text-slate-300 text-sm">{formatVolume(coin.volume_24h)}</td>

      <td className="py-3 px-2 text-right">
        <div className="flex items-center justify-end gap-1 text-sm font-mono text-slate-300">
          <Droplets size={12} className="text-cyan-400" />{formatVolume(coin.liquidity_usd)}
        </div>
      </td>

      <td className="py-3 px-2 text-right font-mono text-slate-300 text-sm">
        {coin.market_cap > 0 ? formatVolume(coin.market_cap) : '—'}
      </td>

      <td className="py-3 px-2 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${buyRatio}%` }} />
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-emerald-400 font-mono">{coin.txns_buys_24h}</span>
            <span className="text-slate-600">/</span>
            <span className="text-red-400 font-mono">{coin.txns_sells_24h}</span>
          </div>
        </div>
      </td>

      <td className="py-3 px-2 text-center text-slate-500 text-xs font-mono">{pairAge(coin.pair_created_at)}</td>

      <td className="py-3 px-2 text-center">
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onWatchlist(coin) }} className={`p-1 rounded transition-colors ${watchlisted ? 'text-yellow-400' : 'text-slate-600 hover:text-yellow-400'}`}>
            <Star size={14} fill={watchlisted ? 'currentColor' : 'none'} />
          </button>
          <a href={`https://dexscreener.com/solana/${coin.pair_address}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1 rounded text-slate-600 hover:text-cyan-400 transition-colors">
            <ExternalLink size={14} />
          </a>
        </div>
      </td>
    </tr>
  )
}
