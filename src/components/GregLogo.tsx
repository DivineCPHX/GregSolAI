export default function GregLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="30" fill="#0f172a" stroke="#22d3ee" strokeWidth="2" />
      <text x="32" y="42" textAnchor="middle" fontSize="28" fontFamily="monospace" fontWeight="bold" fill="#22d3ee">G</text>
      <circle cx="48" cy="12" r="6" fill="#10b981" />
      <circle cx="46" cy="12" r="2" fill="#0f172a" />
    </svg>
  )
}
