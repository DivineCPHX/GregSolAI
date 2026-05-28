import type { FilterTab } from '../lib/types'
import { Flame, Clock, TrendingUp, TrendingDown, ChartBar as BarChart2 } from 'lucide-react'

const TABS: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
  { id: 'trending', label: 'Trending', icon: <Flame size={14} /> },
  { id: 'new', label: 'New Pairs', icon: <Clock size={14} /> },
  { id: 'gainers', label: 'Gainers', icon: <TrendingUp size={14} /> },
  { id: 'losers', label: 'Losers', icon: <TrendingDown size={14} /> },
  { id: 'high_volume', label: 'High Volume', icon: <BarChart2 size={14} /> },
]

interface Props {
  active: FilterTab
  onChange: (tab: FilterTab) => void
}

export default function FilterTabs({ active, onChange }: Props) {
  return (
    <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
            active === tab.id
              ? 'bg-cyan-500 text-slate-900 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
          }`}
        >
          {tab.icon}
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}
