import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SearchBar({ value, onChange }: Props) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search coins..."
        className="w-full pl-9 pr-8 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
      />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
