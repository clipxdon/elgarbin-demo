// Original SVG illustrations: wordmark, comb and jar fallbacks (no WebGL / reduced motion), hives for the rooms.
const hex = (cx, cy, r) => Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 2 + (k * Math.PI) / 3; return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}` }).join(' ')

export function HexIcon({ size = 18, fill = 'currentColor' }) {
  return <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true"><polygon points={hex(10, 10, 9)} fill={fill} /></svg>
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <svg viewBox="0 0 20 20" aria-hidden="true"><polygon points={hex(10, 10, 9)} fill="none" stroke="currentColor" strokeWidth="1.6" /><polygon points={hex(10, 10, 4.2)} fill="#E8A33D" /></svg>
      El Garbin
    </span>
  )
}

export function CombArt() {
  const cells = []
  const R = 16
  for (let q = -3; q <= 3; q++) for (let r = -3; r <= 3; r++) {
    const s = -q - r; if (Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) > 3) continue
    const x = 120 + R * Math.sqrt(3) * (q + r / 2), y = 120 + R * 1.5 * r, d = Math.hypot(q, r)
    cells.push(<g key={`${q}${r}`}><polygon points={hex(x, y, R - 1)} fill="#E2B85C" /><polygon points={hex(x, y, R - 4)} fill={d < 2.2 ? '#E39A2A' : (q + r) % 3 ? '#F3DFA6' : '#3a240f'} /></g>)
  }
  return <svg viewBox="0 0 240 240" role="img" aria-label="Illustrazione: un favo di miele">{cells}</svg>
}

export function JarArt({ color = '#E8A33D' }) {
  return (
    <svg viewBox="0 0 200 240" role="img" aria-label="Illustrazione: un vasetto di miele">
      <rect x="58" y="22" width="84" height="22" rx="6" fill="#C9973C" />
      <path d="M50 56h100q10 0 10 12v138q0 14-14 14H54q-14 0-14-14V68q0-12 10-12z" fill="#fff7e6" opacity=".25" />
      <path d="M44 96h112v110q0 10-10 10H54q-10 0-10-10z" fill={color} style={{ transition: 'fill .6s' }} />
      <rect x="40" y="120" width="120" height="46" fill="#F6EBD3" />
      <text x="100" y="150" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="20" fill="#1C140C">El Garbin</text>
      <path d="M58 70v120" stroke="#fff" strokeOpacity=".4" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

export function HiveArt({ color }) {
  return (
    <svg viewBox="0 0 200 170" aria-hidden="true" className="hive">
      <ellipse cx="100" cy="160" rx="78" ry="7" fill="#000" opacity=".12" />
      <rect x="40" y="132" width="120" height="22" rx="3" fill="#8A4B12" />
      <rect x="44" y="90" width="112" height="44" rx="3" fill={color} />
      <rect x="44" y="58" width="112" height="34" rx="3" fill={color} style={{ filter: 'brightness(1.08)' }} />
      <rect x="86" y="124" width="28" height="6" rx="3" fill="#1C140C" />
      <g className="hive-roof"><path d="M32 58l68-26 68 26z" fill="#F6EBD3" stroke="#8A4B12" strokeWidth="3" strokeLinejoin="round" /></g>
      <g className="hive-bees" fill="#1C140C">
        <circle cx="70" cy="40" r="3" /><circle cx="128" cy="28" r="3" /><circle cx="150" cy="46" r="3" />
      </g>
    </svg>
  )
}
