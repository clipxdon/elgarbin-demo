// Shared mutable scene state: ScrollTrigger writes, the R3F loop reads (no React re-renders).
export const scene = {
  leave: 0,  // hero -> chi siamo: the comb drifts and breaks into cells
  trans: 0,  // transumanza progress (cells float like pollen)
  jarIn: 0,  // mieli section enters
  jar: 0,    // 0..1 through the seven honeys
  jarOut: 0, // mieli section leaves
  pointer: { x: 0, y: 0 },
}

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isMobile =
  typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches

// Design DNA: El Garbin, "Dal fiore al vasetto"
export const PALETTE = {
  notte: '#1C140C',
  ambra: '#8A4B12',
  miele: '#E8A33D',
  cera: '#F6EBD3',
  azzurra: '#6FA3C7',
  rossa: '#C2483D',
  verde: '#6E9B5A',
}

export const clamp01 = (v) => Math.min(1, Math.max(0, v))
export const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t) }
