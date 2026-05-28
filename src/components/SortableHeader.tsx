import { ChevronUp, ChevronDown } from 'lucide-react'
import type { SortField, SortDir } from '../lib/types'

interface Props {
  field: SortField
  label: string
  active: SortField
  dir: SortDir
  onSort: (field: SortField) => void
}

export default function SortableHeader({ field, label, active, dir, onSort }: Props) {
  const isActive = active === field
  return (
    <th
      className={`py-2.5 px-2 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer select-none transition-colors ${
        isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
      }`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center justify-end gap-1">
        {label}
        <span className="flex flex-col">
          <ChevronUp size={10} className={isActive && dir === 'asc' ? 'opacity-100' : 'opacity-30'} />
          <ChevronDown size={10} className={isActive && dir === 'desc' ? 'opacity-100' : 'opacity-30'} />
        </span>
      </div>
    </th>
  )
}
