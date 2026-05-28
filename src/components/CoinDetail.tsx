import { X, ExternalLink, Star, Copy, CheckCheck, Droplets, TrendingUp, Zap } from 'lucide-react'
import { useState } from 'react'
import type { Coin } from '../lib/types'
import { formatUSD, formatVolume, pairAge, timeAgo, gregRating } from '../lib/format'
import PriceChangeBadge from './PriceChangeBadge'

interface Props {
  coin: Coin
  onClose: () => void
  watchlisted: boolean
  onWatchlist: (coin: Coin) => void
}

export default function CoinDetail({ coin, onClose, watchlisted, onWatchlist }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalTxns = coin.txns_buys_24h + coin.txns_sells_24h
  const buyPct = totalTxns > 0 ? (coin.txns_buys_24h / totalTxns) * 100 : 50
  const rating = gregRating(coin)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {coin.image_url ? (
              <img src={coin.image_url} alt={coin.symbol} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-sm font-bold text-slate-900">
                {coin.symbol.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="font-bold text-white text-xl leading-tight">{coin.symbol}</h2>
              <p className="text-slate-400 text-sm">{coin.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onWatchlist(coin)} className={`p-2 rounded-lg transition-colors ${watchlisted ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-500 hover:text-yellow-400 hover:bg-slate-800'}`}>
              <Star size={18} fill={watchlisted ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Greg's Take */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} className="text-cyan-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Greg's Take</span>
            </div>
            <div className={`text-2xl font-black mb-1 ${rating.color}`}>{rating.label}</div>
            <p className="text-slate-400 text-sm">{rating.note}</p>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/40 rounded-xl p-4">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Price USD</div>
              <div className="text-white font-mono font-bold text-lg">{formatUSD(coin.price_usd)}</div>
              <div className="text-slate-500 text-xs font-mono mt-0.5">{coin.price_sol.toFixed(8)} SOL</div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Market Cap</div>
              <div className="text-white font-mono font-bold text-lg">{coin.market_cap > 0 ? formatVolume(coin.market_cap) : '—'}</div>
              <div className="text-slate-500 text-xs font-mono mt-0.5">FDV: {coin.fdv > 0 ? formatVolume(coin.fdv) : '—'}</div>
            </div>
          </div>

          {/* Price Changes */}
          <div>
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Price Change</div>
            <div className="grid grid-cols-3 gap-2">
              {[['1H', coin.price_change_1h], ['6H', coin.price_change_6h], ['24H', coin.price_change_24h]].map(([label, val]) => (
                <div key={label} className="bg-slate-800/40 rounded-lg p-3 text-center">
                  <div className="text-slate-500 text-xs mb-1">{label}</div>
                  <PriceChangeBadge value={val as number} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Volume & Liquidity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/40 rounded-xl p-4">
              <div className="flex items-center gap-1 text-slate-500 text-xs uppercase tracking-wider mb-1">
                <TrendingUp size={10} /> Volume 24H
              </div>
              <div className="text-white font-mono font-semibold">{formatVolume(coin.volume_24h)}</div>
            </div>
            <div className="bg-slate-800/40 rounded-xl p-4">
              <div className="flex items-center gap-1 text-slate-500 text-xs uppercase tracking-wider mb-1">
                <Droplets size={10} /> Liquidity
              </div>
              <div className="text-white font-mono font-semibold">{formatVolume(coin.liquidity_usd)}</div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-slate-800/40 rounded-xl p-4">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-3">Transactions 24H</div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all rounded-full" style={{ width: `${buyPct}%` }} />
              </div>
              <span className="text-xs text-slate-400 font-mono w-12 text-right">{buyPct.toFixed(0)}% buy</span>
            </div>
            <div className="flex justify-between text-sm font-mono">
              <span className="text-emerald-400">{coin.txns_buys_24h} buys</span>
              <span className="text-red-400">{coin.txns_sells_24h} sells</span>
            </div>
          </div>

          {/* Contract Address */}
          <div className="bg-slate-800/40 rounded-xl p-4">
            <div className="text-slate-500 text-xs uppercase tracking-wider mb-2">Token Address</div>
            <div className="flex items-center gap-2">
              <code className="text-xs text-cyan-400 font-mono truncate flex-1">{coin.token_address}</code>
              <button onClick={() => copy(coin.token_address)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 transition-colors shrink-0">
                {copied ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Pair age: <span className="text-slate-300 font-mono">{pairAge(coin.pair_created_at)}</span></span>
            <span>Updated: <span className="text-slate-300 font-mono">{timeAgo(coin.last_fetched_at)}</span></span>
            <span className="uppercase font-semibold text-slate-400">{coin.dex_id}</span>
          </div>

          {/* Links */}
          <div className="flex gap-3">
            <a href={`https://dexscreener.com/solana/${coin.pair_address}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold transition-colors">
              <ExternalLink size={14} /> DexScreener
            </a>
            <a href={`https://birdeye.so/token/${coin.token_address}?chain=solana`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold transition-colors">
              <ExternalLink size={14} /> Birdeye
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
