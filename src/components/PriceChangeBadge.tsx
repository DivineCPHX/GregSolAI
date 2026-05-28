import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatPct } from '../lib/format'

interface Props {
  value: number
  size?: 'sm' | 'md'
}

export default function PriceChangeBadge({ value, size = 'md' }: Props) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const iconSize = size === 'sm' ? 12 : 14

  if (value > 0) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-semibold ${textSize} text-emerald-400`}>
        <TrendingUp size={iconSize} />{formatPct(value)}
      </span>
    )
  }
  if (value < 0) {
    return (
      <span className={`inline-flex items-center gap-1 font-mono font-semibold ${textSize} text-red-400`}>
        <TrendingDown size={iconSize} />{formatPct(value)}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center gap-1 font-mono font-semibold ${textSize} text-slate-400`}>
      <Minus size={iconSize} />0.00%
    </span>
  )
}
