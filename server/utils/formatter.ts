export function formatUSD(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  if (value >= 1) return `$${value.toFixed(4)}`
  if (value >= 0.01) return `$${value.toFixed(6)}`
  return `$${value.toExponential(2)}`
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatVolume(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(0)}`
}

export function pairAge(dateStr: string | null): string {
  if (!dateStr) return '?'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Unknown'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function gregRating(coin: {
  price_change_24h: number
  volume_24h: number
  txns_buys_24h: number
  txns_sells_24h: number
  liquidity_usd: number
}): { label: string; note: string } {
  const totalTxns = coin.txns_buys_24h + coin.txns_sells_24h
  const buyPct = totalTxns > 0 ? (coin.txns_buys_24h / totalTxns) * 100 : 50

  const score =
    (coin.price_change_24h > 20 ? 2 : coin.price_change_24h > 5 ? 1 : 0) +
    (coin.volume_24h > 100000 ? 2 : coin.volume_24h > 20000 ? 1 : 0) +
    (buyPct > 60 ? 2 : buyPct > 50 ? 1 : 0) +
    (coin.liquidity_usd > 50000 ? 1 : 0)

  if (score >= 6) return { label: 'SEND IT', note: 'Greg says this is a certified degen play. NFA.' }
  if (score >= 4) return { label: 'LOOKS SPICY', note: "Momentum is building. Greg's watching closely." }
  if (score >= 2) return { label: 'MEH', note: "Greg's not impressed. Could pump, could dump." }
  return { label: 'STAY AWAY', note: "Greg says this is a no. Smells rugged." }
}
