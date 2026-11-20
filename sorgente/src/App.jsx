import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import SplitText from './components/SplitText'
import CountUp from './components/CountUp'
import Magnetic from './components/Magnetic'
import { CombArt, JarArt, HiveArt, HexIcon, Wordmark } from './components/Art'
import { G, HONEYS, ROUTE, STEPS, ROOMS, SERVICES, AROUND, PRODUCTS } from './content'
import { scene, reducedMotion, isMobile } from './store'

gsap.registerPlugin(ScrollTrigger)
const Scene = lazy(() => import('./three/Scene'))
const webglOK = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()
const use3D = !reducedMotion && webglOK

const NAV = [
  { id: 'storia', label: 'Chi siamo' },
  { id: 'transumanza', label: 'Transumanza' },
  { id: 'mieli', label: 'I mieli' },
  { id: 'camere', label: 'Le camere' },
  { id: 'contatti', label: 'Contatti' },
]

function useLenis() {
  useEffect(() => {
    if (reducedMotion) return
    // long, "viscous" easing: the page moves like honey
    const lenis = new Lenis({ duration: 1.7, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    window.__lenis = lenis
    return () => { gsap.ticker.remove(raf); lenis.destroy() }
  }, [])
}

const go = (id) => (e) => {
  e.preventDefault()
  const el = document.getElementById(id)
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: 0 })
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
}

// Hexagonal cursor follower (pointer devices only): grows over links and buttons.
function HexCursor() {
  const ref = useRef(null)
  useEffect(() => {
    if (reducedMotion || isMobile || !window.matchMedia('(pointer:fine)').matches) return
    const el = ref.current
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' })
    const move = (e) => { xTo(e.clientX); yTo(e.clientY); el.classList.toggle('big', !!e.target.closest('a,button,label,.room')) }
    const show = () => { el.style.opacity = 1 }
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointermove', show, { passive: true, once: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return <div ref={ref} className="hex-cursor" aria-hidden="true"><HexIcon size={34} fill="none" /></div>
}

function Nav() {
  const [solid, setSolid] = useState(false)
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header className={`nav ${solid ? 'is-solid' : ''}`}>
      <a href="#top" onClick={go('top')} aria-label="El Garbin, torna su"><Wordmark /></a>
      <nav aria-label="Sezioni">
        {NAV.map((n) => <a key={n.id} href={`#${n.id}`} onClick={go(n.id)}>{n.label}</a>)}
      </nav>
      <a className="nav-cta" href="#contatti" onClick={go('contatti')}>Prenota</a>
    </header>
  )
}

function Hero() {
  return (
    <section id="top" className="hero">
      {!use3D && <div className="hero-art"><CombArt /></div>}
      <div className="hero-copy">
        <p className="eyebrow reveal">Apicoltura biologica e agriturismo · Savigliano · dal 1998</p>
        <SplitText as="h1" text="Dormire dove nasce il miele." immediate delay={0.2} stagger={0.028} />
        <p className="lead reveal">In piemontese <em>el garbin</em> è l'alveare. Qui trovi sette mieli biologici raccolti seguendo le fioriture del Piemonte e tre camere affacciate sul Monviso.</p>
        <div className="cta reveal">
          <Magnetic className="btn btn-honey" href="#mieli" onClick={go('mieli')}>Scopri i mieli</Magnetic>
          <Magnetic className="btn btn-ghost" href="#camere" onClick={go('camere')}>Le camere</Magnetic>
        </div>
        <p className="rating reveal"><b>4,9</b> <span aria-hidden="true">★★★★★</span> su Google · 151 recensioni</p>
      </div>
      <div className="scroll-cue" aria-hidden="true"><span /></div>
    </section>
  )
}

function Storia() {
  return (
    <section id="storia" className="storia">
      <div className="wrap two">
        <div>
          <p className="eyebrow">Chi siamo</p>
          <SplitText text="Una passione per le api, dal 1998." className="h2" />
          <p>El Garbin nasce dopo alcuni anni di apicoltura per passione. Oggi è una società agricola alle porte di Savigliano, già in campagna ma a un passo dal centro, con le Alpi a fare da cornice.</p>
          <p>Tutta la produzione è <b>biologica, controllata e certificata da Ecocert Italia</b>: niente prodotti chimici di sintesi per curare gli alveari, e api che raccolgono lontano da industrie, autostrade e colture intensive.</p>
        </div>
        <div className="stats">
          <div className="stat"><b><CountUp to={new Date().getFullYear() - 1998} /></b><span>anni con le api</span></div>
          <div className="stat"><b><CountUp to={7} /></b><span>mieli biologici</span></div>
          <div className="stat"><b><CountUp to={300} /> m²</b><span>di mieleria, costruita nel 2001</span></div>
          <div className="stat"><b><CountUp to={1500} /> m</b><span>la fioritura più alta, in Valle Maira</span></div>
        </div>
      </div>
    </section>
  )
}

// smooth path through the route points (Catmull-Rom -> cubic Bézier)
function routePath(pts) {
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2
    d += ` C${p1.x + (p2.x - p0.x) / 6},${p1.y + (p2.y - p0.y) / 6} ${p2.x - (p3.x - p1.x) / 6},${p2.y - (p3.y - p1.y) / 6} ${p2.x},${p2.y}`
  }
  return d
}
const ROUTE_D = routePath(ROUTE)

function Transumanza({ stop }) {
  return (
    <section id="transumanza" className="transumanza">
      <div className="pin-inner">
        <div className="trans-head">
          <p className="eyebrow">Il nomadismo</p>
          <h2 className="h2">Le api seguono <em>i fiori.</em></h2>
          <p className="lead-s">Da aprile ad agosto gli alveari viaggiano di notte verso le fioriture migliori del Piemonte: dalla pianura fino a 1500 metri. È così che nascono sette mieli diversi.</p>
        </div>
        <svg className="route" viewBox="0 0 940 360" aria-hidden="true">
          <defs>
            <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E8A33D" stopOpacity=".28" /><stop offset="1" stopColor="#E8A33D" stopOpacity="0" /></linearGradient>
          </defs>
          <path d={`${ROUTE_D} L880,360 L60,360 Z`} fill="url(#hill)" />
          <path className="route-base" d={ROUTE_D} fill="none" stroke="#F6EBD3" strokeOpacity=".2" strokeWidth="2" strokeDasharray="4 8" />
          <path className="route-line" d={ROUTE_D} fill="none" stroke="#E8A33D" strokeWidth="3" strokeLinecap="round" />
          {ROUTE.map((p, i) => (
            <g key={p.n} className={`stop ${i <= stop ? 'on' : ''}`} transform={`translate(${p.x},${p.y})`}>
              <polygon points="0,-11 9.5,-5.5 9.5,5.5 0,11 -9.5,5.5 -9.5,-5.5" />
              <text className="stop-n" y={34} textAnchor="middle">{p.n}</text>
              <text className="stop-m" y={52} textAnchor="middle">{p.m}{p.alt ? ` · ${p.alt}` : ''}</text>
            </g>
          ))}
          <g className="hive-marker"><rect x="-14" y="-24" width="28" height="22" rx="3" fill="#E8A33D" /><path d="M-18 -24 L0 -34 L18 -24 Z" fill="#F6EBD3" /><rect x="-5" y="-8" width="10" height="3" rx="1.5" fill="#1C140C" /></g>
        </svg>
        <ol className="route-list">
          {ROUTE.map((p, i) => (
            <li key={p.n} className={i === stop ? 'on' : ''}><b>{p.n}</b> <span>{p.m} · {p.where}{p.alt ? `, ${p.alt}` : ''}</span></li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function pickHoney(i, setHoney) {
  const st = window.__mieliST
  if (!st) { setHoney(i); return }
  const y = st.start + (st.end - st.start) * ((i + 0.5) / HONEYS.length)
  if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 }); else window.scrollTo({ top: y, behavior: 'smooth' })
}

function Mieli({ active, setHoney }) {
  const h = HONEYS[active]
  return (
    <section id="mieli" className="mieli">
      <div className="pin-inner mieli-inner">
        {!use3D && <div className="jar-art"><JarArt color={h.c} /></div>}
        <div className="mieli-copy">
          <p className="eyebrow">I sette mieli</p>
          <h2 className="h2">Dal quasi bianco <em>al quasi nero.</em></h2>
          <div className="honey-card" aria-live="polite">
            <p className="honey-idx">{String(active + 1).padStart(2, '0')} / 07</p>
            <h3 key={h.id} className="honey-name">{h.n}{h.sub && <small> · {h.sub}</small>}</h3>
            <dl>
              <div><dt>Dove</dt><dd>{h.zona}</dd></div>
              <div><dt>Raccolto</dt><dd>{h.mesi}</dd></div>
            </dl>
            <p className="honey-note">{h.note}</p>
          </div>
          <ul className="swatches" aria-label="I sette mieli">
            {HONEYS.map((x, i) => (
              <li key={x.id} className={i === active ? 'on' : ''}><button type="button" aria-pressed={i === active} aria-label={`Miele di ${x.n}`} onClick={() => pickHoney(i, setHoney)}><i style={{ background: x.c }} /></button><span>{x.n}</span></li>
            ))}
          </ul>
          <p className="bio-badge"><HexIcon size={14} /> Tutti biologici, certificati Ecocert</p>
        </div>
      </div>
    </section>
  )
}

function Mieleria() {
  return (
    <section id="mieleria" className="mieleria">
      <div className="spec-pin">
        <div className="spec-head">
          <p className="eyebrow">La mieleria</p>
          <SplitText text="Dal favo al vasetto, sempre a freddo." className="h2" />
        </div>
        <div className="track">
          {STEPS.map((s) => (
            <article className="card" key={s.n}>
              <div className="card-top"><span className="card-n">{s.n}</span><span className="card-k">{s.k}</span></div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
          <div className="card card-end">
            <p className="card-kicker">Dall'alveare anche</p>
            <ul className="prod">
              {PRODUCTS.map((p) => <li key={p.n}><b>{p.n}</b><span>{p.d}</span></li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Camere() {
  return (
    <section id="camere" className="camere">
      <div className="wrap">
        <p className="eyebrow dark">Agriturismo B&amp;B</p>
        <SplitText text="Tre camere, i colori delle nostre arnie." className="h2" />
        <p className="intro">Le camere sono al piano sopra la mieleria. Ognuna ha il bagno privato, un colore che la distingue e la vista sul giardino e sulle montagne.</p>
        <div className="rooms">
          {ROOMS.map((r) => (
            <article key={r.id} className="room" style={{ '--c': r.c }}>
              <HiveArt color={r.c} />
              <p className="room-tone">{r.tone}</p>
              <h3>Camera {r.n}</h3>
              <p>{r.d}</p>
              <p className="room-bed">{r.bed}</p>
            </article>
          ))}
        </div>
        <div className="price">
          <p><span>Camera doppia o matrimoniale</span><b>da 80 € a notte</b></p>
          <p><span>Uso singola</span><b>da 60 €</b></p>
          <p className="muted">Colazione inclusa · check-in dalle 15:00 · check-out entro le 10:00 · prezzi indicativi da confermare</p>
        </div>
      </div>
    </section>
  )
}

function Soggiorno() {
  return (
    <section id="soggiorno" className="soggiorno">
      <div className="wrap two">
        <div>
          <p className="eyebrow dark">Il soggiorno</p>
          <SplitText text="Semplice, curato, tranquillo." className="h2" />
          <ul className="services">
            {SERVICES.map((s) => <li key={s}><HexIcon size={12} fill="#E8A33D" />{s}</li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow dark">Nei dintorni</p>
          <h3 className="h3">Nel cuore delle terre dei Savoia.</h3>
          <ul className="around">
            {AROUND.map((a) => <li key={a.n}><b>{a.n}</b><span>{a.d}</span></li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}

function Contatti() {
  const [tab, setTab] = useState('camera')
  const [sent, setSent] = useState(false)
  return (
    <section id="contatti" className="contatti">
      <div className="wrap two">
        <div>
          <p className="eyebrow">Contatti</p>
          <SplitText text="Vieni a trovarci all'alveare." className="h2" />
          <address>
            <p><b>{G.name}</b><br />{G.address}</p>
            <p><a href={`tel:${G.tel}`} className="tel">{G.phone}</a></p>
            <p className="people">{G.people.map((p) => <a key={p.n} href={`tel:${p.tel}`}>{p.n} · {p.phone}</a>)}</p>
            <p><a href={`mailto:${G.email}`}>{G.email}</a></p>
            <p className="muted">Miele anche al punto vendita di Racconigi, {G.racconigi}.</p>
          </address>
          <div className="cta">
            <a className="btn btn-honey" href={`tel:${G.tel}`}>Chiama</a>
            <a className="btn btn-ghost" href={G.maps} target="_blank" rel="noopener">Apri in Maps</a>
          </div>
        </div>
        <form className="form" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
          <div className="tabs" role="tablist" aria-label="Tipo di richiesta">
            <button type="button" role="tab" aria-selected={tab === 'camera'} className={tab === 'camera' ? 'on' : ''} onClick={() => setTab('camera')}>Una camera</button>
            <button type="button" role="tab" aria-selected={tab === 'miele'} className={tab === 'miele' ? 'on' : ''} onClick={() => setTab('miele')}>Il miele</button>
          </div>
          <label>Nome<input name="nome" required autoComplete="name" /></label>
          <label>Telefono o email<input name="contatto" required /></label>
          {tab === 'camera' ? (
            <>
              <div className="row">
                <label>Arrivo<input type="date" name="arrivo" /></label>
                <label>Partenza<input type="date" name="partenza" /></label>
              </div>
              <label>Camera<select name="camera"><option>Nessuna preferenza</option>{ROOMS.map((r) => <option key={r.id}>{r.n}</option>)}</select></label>
            </>
          ) : (
            <label>Quali mieli<textarea name="mieli" rows="3" placeholder="Es. 2 vasetti di acacia e 1 di castagno" /></label>
          )}
          <button className="btn btn-honey" type="submit">Invia richiesta</button>
          {sent && <p className="ok" role="status">Grazie! Questa è una bozza: nel sito definitivo la richiesta arriverà direttamente a El Garbin.</p>}
        </form>
      </div>
      <footer className="foot">
        <Wordmark />
        <p>© {new Date().getFullYear()} {G.legal} · P.IVA {G.piva}</p>
        <p className="muted">Bozza dimostrativa: illustrazioni e scena 3D originali.</p>
      </footer>
    </section>
  )
}

function useMotion(setActive, setStop, setHoney) {
  useLayoutEffect(() => {
    if (reducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from('.hero .reveal', { y: 30, opacity: 0, duration: 1.6, ease: 'expo.out', stagger: 0.12, delay: 0.6 })
      const sc = (vars, key) => ScrollTrigger.create({ ...vars, onUpdate: (s) => { scene[key] = s.progress } })

      // the comb breaks into cells as we leave the hero
      sc({ trigger: '#storia', start: 'top bottom', end: 'bottom 30%', scrub: true }, 'leave')
      gsap.utils.toArray('.stat').forEach((el, i) => gsap.from(el, { y: 50, opacity: 0, duration: 1.2, delay: i * 0.08, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 85%', once: true } }))
      gsap.from('.storia .two > div:first-child > p', { y: 30, opacity: 0, stagger: 0.15, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: '.storia', start: 'top 70%', once: true } })

      // transumanza: the hive travels along the route
      const line = document.querySelector('.route-line'), marker = document.querySelector('.hive-marker')
      const L = line.getTotalLength()
      line.style.strokeDasharray = L; line.style.strokeDashoffset = L
      const stopsAt = ROUTE.map((p) => { let best = 0, bd = 1e9; for (let l = 0; l <= L; l += 4) { const q = line.getPointAtLength(l); const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = l } } return best / L })
      let last = -1
      const place = (p) => {
        line.style.strokeDashoffset = L * (1 - p)
        const q = line.getPointAtLength(L * p); marker.setAttribute('transform', `translate(${q.x},${q.y})`)
        let s = -1; stopsAt.forEach((v, i) => { if (p >= v - 0.005) s = i })
        if (s !== last) { last = s; setStop(s) }
      }
      place(0)
      const tl = gsap.timeline({ scrollTrigger: { trigger: '#transumanza', start: 'top top', end: isMobile ? '+=170%' : '+=230%', pin: true, scrub: 0.9, onUpdate: (s) => { scene.trans = s.progress } } })
      tl.from('.trans-head > *', { y: 40, opacity: 0, stagger: 0.1, duration: 0.3 })
      const o = { p: 0 }
      tl.to(o, { p: 1, duration: 1.6, ease: 'none', onUpdate: () => place(o.p) })
      tl.to({}, { duration: 0.2 })

      // mieli: the jar fills and changes colour honey by honey
      sc({ trigger: '#mieli', start: isMobile ? 'top 45%' : 'top 75%', end: 'top top', scrub: true }, 'jarIn')
      let lastH = -1
      window.__mieliST = ScrollTrigger.create({ trigger: '#mieli', start: 'top top', end: isMobile ? '+=260%' : '+=320%', pin: true, scrub: 0.8,
        onUpdate: (s) => { scene.jar = s.progress; const i = Math.min(HONEYS.length - 1, Math.floor(s.progress * HONEYS.length * 0.999)); if (i !== lastH) { lastH = i; setHoney(i) } } })
      sc({ trigger: '#mieleria', start: 'top bottom', end: 'top 10%', scrub: true }, 'jarOut')

      // mieleria: horizontal track (desktop)
      const mm = gsap.matchMedia()
      mm.add('(min-width: 761px)', () => {
        const track = document.querySelector('.track')
        const dist = () => track.scrollWidth - window.innerWidth + 80
        gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.spec-pin', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.7, invalidateOnRefresh: true } })
      })
      mm.add('(max-width: 760px)', () => {
        gsap.utils.toArray('.card').forEach((c) => gsap.from(c, { y: 60, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: c, start: 'top 88%', once: true } }))
      })

      // rooms: hives rise one after the other, roofs lift
      gsap.from('.room', { y: 80, opacity: 0, duration: 1.3, ease: 'power3.out', stagger: 0.15, scrollTrigger: { trigger: '.rooms', start: 'top 80%', once: true } })
      gsap.utils.toArray('.room .hive-roof').forEach((r, i) => gsap.fromTo(r, { y: 0 }, { y: -10, rotate: -4, transformOrigin: '30% 100%', duration: 1, ease: 'elastic.out(1,0.5)', delay: 0.6 + i * 0.15, scrollTrigger: { trigger: '.rooms', start: 'top 70%', once: true } }))
      gsap.utils.toArray('.price, .services li, .around li, .form, address').forEach((el) => gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }))

      // pause WebGL when the opaque sections cover the canvas
      ScrollTrigger.create({ trigger: '#camere', start: 'top top', end: 'max', onToggle: (s) => setActive(!s.isActive) })
    })
    const fonts = document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const onPointer = (e) => { scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1; scene.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1) }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => { ctx.revert(); window.removeEventListener('pointermove', onPointer); void fonts }
  }, [setActive, setStop, setHoney])
}

export default function App() {
  const [active, setActive] = useState(true)
  const [stop, setStop] = useState(reducedMotion ? ROUTE.length - 1 : -1)
  const [honey, setHoney] = useState(0)
  useLenis()
  useMotion(setActive, setStop, setHoney)
  return (
    <>
      {use3D && (
        <div className="webgl-wrap" aria-hidden="true">
          <Suspense fallback={null}><Scene active={active} /></Suspense>
        </div>
      )}
      <a className="skip" href="#contatti">Vai ai contatti</a>
      <HexCursor />
      <Nav />
      <main>
        <Hero />
        <Storia />
        <Transumanza stop={stop} />
        <Mieli active={honey} setHoney={setHoney} />
        <Mieleria />
        <Camere />
        <Soggiorno />
        <Contatti />
      </main>
    </>
  )
}
