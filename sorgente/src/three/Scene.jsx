// The 3D story of El Garbin ("l'alveare"): a breathing honeycomb that breaks into cells,
// pollen drifting through the whole page, and a jar that fills with the seven honeys.
// Everything is procedural: no images, no HDR downloads.
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { scene, isMobile, smooth, clamp01 } from '../store'
import { HONEYS } from '../content'

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }

// ---------- honey-light background with the Alps on the horizon ----------
const bgVert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.999, 1.0); }`
const bgFrag = `
precision highp float; varying vec2 vUv;
uniform float uTime; uniform vec2 uRes; uniform vec2 uPointer; uniform float uHero; uniform vec3 uTint; uniform float uTintK;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float a=.5, s=0.; for(int i=0;i<5;i++){ s+=a*vn(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
float ridge(float x, float s){ return fbm(vec2(x*s, 3.1))*.5 + fbm(vec2(x*s*2.7, 8.))*.18; }
void main(){
  vec2 uv = vUv; float asp = uRes.x/uRes.y; vec2 p = (uv-.5)*vec2(asp,1.);
  float t = uTime*.03;
  // slow, viscous honey flow
  vec2 q = vec2(fbm(p*1.3+vec2(0.,t)), fbm(p*1.3+vec2(4.7,-t)));
  float f = fbm(p*1.1 + q*1.6 + vec2(t*.5, t*.2));
  vec3 notte = vec3(.075,.05,.03), ambra = vec3(.32,.17,.05), miele = vec3(.91,.64,.24);
  vec3 col = mix(notte, ambra, smoothstep(.4,.95,f)*.85);
  float glow = pow(smoothstep(.55,.98, f + q.y*.2), 3.);
  float near = smoothstep(.9, 0., length(p - uPointer*vec2(asp,1.)*.5));
  col += miele * glow * (.12 + .12*near);
  // sunset light behind the mountains
  col += miele * .22 * smoothstep(.9, .0, length((uv-vec2(.62,.18))*vec2(asp*.7,1.4))) * uHero;
  // the Alps (Monviso as the highest peak) on the horizon in the hero
  float x = uv.x*asp;
  float peak = .22 + ridge(x+.3, 1.6)*.22 + .2*exp(-pow((uv.x-.68)*7.,2.));
  float near2 = .12 + ridge(x+7., 2.4)*.13;
  float m1 = smoothstep(peak+.002, peak-.002, uv.y), m2 = smoothstep(near2+.002, near2-.002, uv.y);
  col = mix(col, vec3(.13,.085,.06), m1*.85*uHero);
  col = mix(col, vec3(.07,.045,.03), m2*.95*uHero);
  // honey tint of the current jar
  col = mix(col, col*.55 + uTint*.32, uTintK);
  col *= 1. - .55*dot(uv-.5, uv-.5)*2.;
  col += (h(uv*uRes+uTime)-.5)*.012; // film grain against banding
  gl_FragColor = vec4(col, 1.);
}`

function Background() {
  const { size } = useThree()
  const tmp = useMemo(() => new THREE.Vector2(), [])
  const c = useMemo(() => new THREE.Color(), [])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uPointer: { value: new THREE.Vector2() }, uHero: { value: 1 }, uTint: { value: new THREE.Color('#E8A33D') }, uTintK: { value: 0 } }), [])
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
    uniforms.uRes.value.set(size.width, size.height)
    uniforms.uPointer.value.lerp(tmp.set(scene.pointer.x, scene.pointer.y), 0.05)
    uniforms.uHero.value = 1 - smooth(0, 0.8, scene.leave)
    honeyColor(scene.jar, c)
    uniforms.uTint.value.lerp(c, 0.08)
    uniforms.uTintK.value = smooth(0.3, 1, scene.jarIn) * (1 - smooth(0, 0.7, scene.jarOut)) * 0.8
  })
  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={bgVert} fragmentShader={bgFrag} uniforms={uniforms} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

const HC = HONEYS.map((x) => new THREE.Color(x.c))
function honeyColor(p, out) {
  const f = clamp01(p) * (HC.length - 1), i = Math.min(HC.length - 2, Math.floor(f))
  return out.copy(HC[i]).lerp(HC[i + 1], smooth(0.35, 0.65, f - i))
}

// ---------- the honeycomb ----------
const RC = 0.16 // cell circumradius
function hexShape(r) {
  const s = new THREE.Shape()
  for (let k = 0; k < 6; k++) { const a = Math.PI / 2 + (k * Math.PI) / 3; const x = Math.cos(a) * r, y = Math.sin(a) * r; k ? s.lineTo(x, y) : s.moveTo(x, y) }
  s.closePath(); return s
}

function Comb() {
  const group = useRef(), walls = useRef(), fills = useRef()
  const rings = isMobile ? 4 : 6
  const cells = useMemo(() => {
    const rand = rng(1998), out = []
    for (let q = -rings; q <= rings; q++) for (let r = -rings; r <= rings; r++) {
      const s = -q - r, d = Math.max(Math.abs(q), Math.abs(r), Math.abs(s))
      if (d > rings) continue
      if (d === rings && rand() < 0.45) continue // organic edge
      const x = RC * Math.sqrt(3) * (q + r / 2), y = RC * 1.5 * r
      const k = d / rings, u = rand()
      const type = u < 0.75 - k * 0.6 ? (rand() < 0.35 + k * 0.3 ? 'cap' : 'honey') : 'empty'
      const ang = Math.atan2(y, x) + (rand() - 0.5)
      out.push({ x, y, d: Math.hypot(x, y), type, level: 0.45 + rand() * 0.5, ph: rand() * 6,
        dir: new THREE.Vector3(Math.cos(ang), Math.sin(ang), -0.6 + rand() * 0.9).normalize(), far: 2 + rand() * 3,
        rot: new THREE.Vector3((rand() - 0.5) * 7, (rand() - 0.5) * 7, (rand() - 0.5) * 4), lift: 0 })
    }
    return out
  }, [rings])
  const wallGeo = useMemo(() => {
    const s = hexShape(RC * 0.995); s.holes.push(hexShape(RC * 0.84))
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 2, curveSegments: 1 })
    g.translate(0, 0, -0.34); return g
  }, [])
  const fillGeo = useMemo(() => { const g = new THREE.ExtrudeGeometry(hexShape(RC * 0.84), { depth: 1, bevelEnabled: false }); g.translate(0, 0, -1); return g }, [])
  const wallMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#E2B85C', roughness: 0.55, metalness: 0 }), [])
  const fillMat = useMemo(() => new THREE.MeshPhysicalMaterial({ roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08, emissive: '#7a3d06', emissiveIntensity: 0.35 }), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colored = useRef(false)
  const local = useMemo(() => new THREE.Vector3(), [])
  const { viewport } = useThree()

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime, g = group.current
    if (!colored.current && fills.current) {
      const c = new THREE.Color(), rand = rng(7)
      cells.forEach((cl, i) => { cl.type === 'cap' ? c.set('#F3DFA6').offsetHSL(0, 0, (rand() - 0.5) * 0.06) : c.set('#E39A2A').offsetHSL((rand() - 0.5) * 0.02, 0, (rand() - 0.5) * 0.12); fills.current.setColorAt(i, c) })
      fills.current.instanceColor.needsUpdate = true; colored.current = true
    }
    const lv = scene.leave, e = smooth(0, 0.8, lv), gone = smooth(0.15, 0.7, lv)
    g.visible = gone < 0.999
    if (!g.visible) return
    const bx = isMobile ? 0 : 1.45, by = isMobile ? 1.12 : 0.05
    g.position.set(bx - e * (isMobile ? 0 : 0.6), by + e * 0.5 + Math.sin(t * 0.6) * 0.03, 0)
    const sc = (isMobile ? 0.5 : 0.84) * (1 + Math.sin(t * 0.9) * 0.008)
    g.scale.setScalar(sc)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -0.28 - scene.pointer.y * 0.18 + e * 0.4, 0.05)
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, -0.42 + scene.pointer.x * 0.25 + e * 0.6, 0.05)
    g.rotation.z = 0.12 + t * 0.01
    // pointer in the comb's plane (approximate, rotation ignored on purpose: it feels softer)
    local.set((scene.pointer.x * viewport.width) / 2 - g.position.x, (scene.pointer.y * viewport.height) / 2 - g.position.y, 0).divideScalar(sc)
    for (let i = 0; i < cells.length; i++) {
      const cl = cells[i]
      const near = Math.max(0, 1 - Math.hypot(cl.x - local.x, cl.y - local.y) / 0.55)
      cl.lift += (near * 0.16 - cl.lift) * Math.min(1, dt * 6)
      const breathe = Math.sin(t * 1.3 - cl.d * 4 + cl.ph * 0.15) * 0.035
      const z = breathe + cl.lift
      const s = 1 - gone
      dummy.position.set(cl.x, cl.y, z).addScaledVector(cl.dir, e * e * cl.far)
      dummy.rotation.set(cl.rot.x * e, cl.rot.y * e, cl.rot.z * e)
      dummy.scale.setScalar(s)
      dummy.updateMatrix(); walls.current.setMatrixAt(i, dummy.matrix)
      if (cl.type === 'empty') { dummy.scale.setScalar(0) }
      else if (cl.type === 'cap') { dummy.position.z += -0.015; dummy.scale.set(s, s, 0.03 * s) }
      else { dummy.position.z += -0.34 + 0.34 * cl.level - 0.02; dummy.scale.set(s, s, 0.34 * cl.level * s + 0.001) }
      dummy.updateMatrix(); fills.current.setMatrixAt(i, dummy.matrix)
    }
    walls.current.instanceMatrix.needsUpdate = true
    fills.current.instanceMatrix.needsUpdate = true
  })
  return (
    <group ref={group}>
      <instancedMesh ref={walls} args={[wallGeo, wallMat, cells.length]} frustumCulled={false} />
      <instancedMesh ref={fills} args={[fillGeo, fillMat, cells.length]} frustumCulled={false} />
    </group>
  )
}

// ---------- pollen drifting across the page ----------
const pVert = `
uniform float uTime; uniform float uSize; uniform float uBoost; attribute float aSeed; varying float vA;
void main(){
  vec3 p = position;
  p.x += sin(uTime*.25 + aSeed*6.) * .35 + uTime*.04*(.5+fract(aSeed*7.));
  p.y += cos(uTime*.2 + aSeed*9.) * .25 + sin(uTime*.1+aSeed)*.2;
  p.x = mod(p.x + 6., 12.) - 6.;
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * (.4 + fract(aSeed*13.)) * (1. + uBoost*.25) / -mv.z;
  vA = (.35 + .65*fract(aSeed*3.)) * (.55 + uBoost*.45);
}`
const pFrag = `varying float vA; void main(){ vec2 c = gl_PointCoord-.5; float d = length(c); float a = smoothstep(.5,.0,d); gl_FragColor = vec4(vec3(1.,.78,.36)*1.2, a*a*vA); }`

function Pollen() {
  const N = isMobile ? 160 : 420
  const { gl } = useThree()
  const geo = useMemo(() => {
    const rand = rng(5), pos = new Float32Array(N * 3), seed = new Float32Array(N)
    for (let i = 0; i < N; i++) { pos[i * 3] = (rand() - 0.5) * 12; pos[i * 3 + 1] = (rand() - 0.5) * 5; pos[i * 3 + 2] = (rand() - 0.5) * 4 - 0.5; seed[i] = rand() }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1)); return g
  }, [N])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 60 * Math.min(2, gl.getPixelRatio()) }, uBoost: { value: 0 } }), [gl])
  useFrame((_, dt) => {
    uniforms.uTime.value += dt
    uniforms.uBoost.value += ((scene.trans > 0 && scene.trans < 1 ? 1 : 0) - uniforms.uBoost.value) * Math.min(1, dt * 2)
  })
  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial vertexShader={pVert} fragmentShader={pFrag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

// ---------- the jar of honey ----------
function labelTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 256
  const x = c.getContext('2d')
  x.fillStyle = '#F6EBD3'; x.fillRect(0, 0, 1024, 256)
  x.strokeStyle = '#8A4B12'; x.lineWidth = 4; x.strokeRect(14, 14, 996, 228)
  x.fillStyle = '#1C140C'; x.textAlign = 'center'
  x.font = 'italic 600 92px Fraunces, Georgia, serif'; x.fillText('El Garbin', 512, 128)
  x.font = '600 28px Manrope, Arial, sans-serif'; x.fillStyle = '#8A4B12'
  x.fillText('MIELE BIOLOGICO · SAVIGLIANO', 512, 190)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t
}

function Jar() {
  const group = useRef(), honey = useRef(), top = useRef(), drip = useRef(), dipper = useRef()
  const glassGeo = useMemo(() => {
    const pts = [[0, -1], [0.62, -1], [0.7, -0.92], [0.72, -0.7], [0.72, 0.62], [0.62, 0.78], [0.56, 0.82], [0.56, 0.95]].map(([a, b]) => new THREE.Vector2(a, b))
    return new THREE.LatheGeometry(pts, isMobile ? 40 : 72)
  }, [])
  const honeyGeo = useMemo(() => { const g = new THREE.CylinderGeometry(0.68, 0.6, 1, isMobile ? 40 : 72, 1, true); g.translate(0, 0.5, 0); return g }, [])
  const topGeo = useMemo(() => new THREE.CircleGeometry(0.68, isMobile ? 40 : 72), [])
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#fff7e6', roughness: 0.04, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }), [])
  const honeyMat = useMemo(() => new THREE.MeshPhysicalMaterial({ color: '#E8A33D', roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.93, emissive: '#000', emissiveIntensity: 0.4, side: THREE.DoubleSide }), [])
  const lidMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#C9973C', metalness: 0.8, roughness: 0.3 }), [])
  const label = useMemo(labelTexture, [])
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9a6a3a', roughness: 0.7 }), [])
  const c = useMemo(() => new THREE.Color(), [])
  useFrame((state) => {
    const t = state.clock.elapsedTime, g = group.current
    const vis = smooth(0, 0.6, scene.jarIn) * (1 - smooth(0.1, 0.9, scene.jarOut))
    g.visible = vis > 0.001
    if (!g.visible) return
    g.position.set(isMobile ? 0 : -1.65, (isMobile ? 0.55 : -0.32) + (1 - vis) * -1.2 + scene.jarOut * 1.2, 0)
    g.scale.setScalar((isMobile ? 0.48 : 0.78) * (0.7 + 0.3 * vis))
    g.rotation.y = -0.4 + scene.jar * 1.2 + scene.pointer.x * 0.25
    g.rotation.x = 0.12 + scene.pointer.y * 0.1
    const level = smooth(0.2, 1, scene.jarIn) * 1.55
    honey.current.scale.y = Math.max(0.001, level)
    top.current.position.y = -0.98 + level + Math.sin(t * 2) * 0.004
    honeyColor(scene.jar, c)
    honeyMat.color.lerp(c, 0.12); honeyMat.emissive.copy(honeyMat.color).multiplyScalar(0.25)
    // the dipper above: a honey strand flows into the jar
    const dy = 1.55 + Math.sin(t * 0.8) * 0.05
    dipper.current.position.set(0.05, dy, 0)
    dipper.current.rotation.z = 0.5 + Math.sin(t * 0.6) * 0.05
    const len = dy - 0.3 - top.current.position.y
    drip.current.position.set(0.05, top.current.position.y + len / 2, 0)
    drip.current.scale.set(1 + Math.sin(t * 3) * 0.15, Math.max(0.001, len), 1 + Math.sin(t * 3) * 0.15)
  })
  return (
    <group ref={group} visible={false}>
      <mesh geometry={glassGeo} material={glassMat} renderOrder={2} />
      <mesh ref={honey} geometry={honeyGeo} material={honeyMat} position={[0, -0.98, 0]} />
      <mesh ref={top} geometry={topGeo} material={honeyMat} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh position={[0, 0.2, 0]} renderOrder={3}>
        <cylinderGeometry args={[0.735, 0.735, 0.5, isMobile ? 40 : 72, 1, true, -Math.PI * 0.45, Math.PI * 0.9]} />
        <meshStandardMaterial map={label} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={drip} material={honeyMat}><cylinderGeometry args={[0.022, 0.035, 1, 12]} /></mesh>
      <group ref={dipper}>
        <mesh material={woodMat} position={[0.55, 0.32, 0]} rotation={[0, 0, -0.9]}><cylinderGeometry args={[0.04, 0.05, 1.3, 12]} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} material={woodMat} position={[0, -0.18 + i * 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.13 - Math.abs(i - 2) * 0.018, 0.03, 8, 24]} /></mesh>
        ))}
        <mesh material={honeyMat} position={[0, -0.12, 0]}><sphereGeometry args={[0.12, 20, 14]} /></mesh>
      </group>
      <mesh position={[0, 0.98, 0]} material={lidMat}><cylinderGeometry args={[0.6, 0.6, 0.14, isMobile ? 40 : 72]} /></mesh>
    </group>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 3]} intensity={2.4} color="#ffe2b0" />
      <directionalLight position={[-4, 1, -2]} intensity={1.4} color="#e0902e" />
      <pointLight position={[0, -1, 2]} intensity={6} color="#ffb347" distance={6} />
      <Environment resolution={isMobile ? 64 : 128} frames={1}>
        <Lightformer form="rect" intensity={3} color="#fff0d2" position={[0, 4, 3]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#e39a2a" position={[-4, 0, 1]} scale={[2, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="ring" intensity={2.2} color="#fff6e6" position={[3, 1, 4]} scale={2} />
      </Environment>
    </>
  )
}

export default function Scene({ active }) {
  return (
    <Canvas
      className="webgl"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, isMobile ? 1.5 : 1.8]}
      camera={{ position: [0, 0, 5.2], fov: 36 }}
      gl={{ antialias: !isMobile, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05 }}
    >
      <Background />
      <Lights />
      <Comb />
      <Pollen />
      <Jar />
    </Canvas>
  )
}
