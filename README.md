# El Garbin · bozza sito 3D

Bozza dimostrativa del nuovo sito per **El Garbin**, apicoltura biologica e agriturismo B&B a Savigliano (CN).

Concept "Dal fiore al vasetto": favo 3D procedurale nell'hero, la transumanza degli alveari legata allo scroll,
un vasetto 3D che si riempie con i sette mieli, la mieleria, le tre camere con i colori delle arnie.
Three.js / React Three Fiber, GSAP ScrollTrigger, Lenis. Nessuna immagine esterna: illustrazioni e scena 3D originali.

- `index.html`: il sito, file unico autonomo (pubblicato con GitHub Pages)
- `sorgente/`: codice sorgente (`npm ci && npm run build` crea `dist/index.html`)

Su mobile la scena è alleggerita; con prefers-reduced-motion il 3D è sostituito da illustrazioni statiche.
