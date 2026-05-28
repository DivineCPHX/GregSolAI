import { RefreshCw } from 'lucide-react'
import { timeAgo } from '../lib/format'

interface Props {
  lastRefresh: string | null
  loading: boolean
  onRefresh: () => void
}

export default function RefreshButton({ lastRefresh, loading, onRefresh }: Props) {
  return (
    <div className="flex items-center gap-3">
      {lastRefresh && (
        <span className="text-slate-500 text-xs hidden sm:inline">Updated {timeAgo(lastRefresh)}</span>
      )}
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        <span className="hidden sm:inline">Refresh</span>
      </button>
    </div>
  )
}
