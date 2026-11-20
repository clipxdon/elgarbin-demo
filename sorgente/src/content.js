export const G = {
  name: 'El Garbin',
  legal: 'Società Agricola El Garbin s.s.',
  address: 'Via della Morina 6, 12038 Savigliano (CN)',
  tel: '+39017231643', phone: '0172 31643',
  people: [
    { n: 'Matteo', tel: '+393355861255', phone: '335 586 1255' },
    { n: 'Debbie', tel: '+393392340695', phone: '339 234 0695' },
  ],
  email: 'info@elgarbin.it',
  racconigi: 'Via Ospedale 11, 12035 Racconigi (CN)',
  maps: 'https://www.google.com/maps/search/?api=1&query=El+Garbin+Via+della+Morina+6+Savigliano',
  piva: '03612420046',
}

// Seven honeys, ordered from the lightest to the darkest (this drives the 3D jar).
export const HONEYS = [
  { id: 'rododendro', n: 'Rododendro', sub: 'Flora alpina', zona: 'Valle Maira, 1500 m', mesi: 'giugno · luglio', c: '#F1E2B0', note: 'Quasi bianco quando cristallizza, profumo lieve e fruttato. Dolce, tenue e delicato.' },
  { id: 'acacia', n: 'Acacia', zona: 'Colline del Monferrato', mesi: 'fine aprile · maggio', c: '#F0CF62', note: 'Giallo paglierino, resta liquido a lungo. Molto dolce, con una nota di vaniglia.' },
  { id: 'tarassaco', n: 'Tarassaco', zona: 'Pianure del Cuneese', mesi: 'aprile', c: '#E7B444', note: 'Cristallizza subito in una crema morbida. Intenso, lascia una sensazione di freschezza.' },
  { id: 'millefiori', n: 'Millefiori', zona: 'Pianure e colline del Cuneese', mesi: 'maggio · luglio', c: '#DB9530', note: 'Ambrato con riflessi arancio. Note floreali e di frutta candita.' },
  { id: 'tiglio', n: 'Tiglio', zona: 'Valle Varaita, 800 m', mesi: 'giugno · luglio', c: '#C27E27', note: 'Fresco, mentolato, balsamico. Intenso e molto persistente.' },
  { id: 'castagno', n: 'Castagno', zona: 'Valle Varaita, 600 m', mesi: 'giugno · luglio', c: '#86431A', note: 'Ambrato scuro con riflessi rossicci. Poco dolce, amarognolo e tannico.' },
  { id: 'melata', n: 'Melata di bosco', zona: 'Parchi e boschi del Cuneese', mesi: 'luglio · agosto', c: '#3B1D0C', note: 'Quasi nero. Meno dolce, sa di malto e di confettura di fichi.' },
]

// Transumanza: the hives follow the blossoms (chronological). alt = altitude when known.
export const ROUTE = [
  { n: 'Tarassaco', m: 'Apr', where: 'Pianura cuneese', alt: null, x: 60, y: 300 },
  { n: 'Acacia', m: 'Mag', where: 'Monferrato', alt: null, x: 190, y: 268 },
  { n: 'Millefiori', m: 'Mag–Lug', where: 'Pianure e colline', alt: null, x: 320, y: 280 },
  { n: 'Castagno', m: 'Giu–Lug', where: 'Valle Varaita', alt: '600 m', x: 450, y: 220 },
  { n: 'Tiglio', m: 'Giu–Lug', where: 'Valle Varaita', alt: '800 m', x: 570, y: 180 },
  { n: 'Rododendro', m: 'Giu–Lug', where: 'Valle Maira', alt: '1500 m', x: 720, y: 70 },
  { n: 'Melata', m: 'Lug–Ago', where: 'Boschi del Cuneese', alt: null, x: 880, y: 200 },
]

export const STEPS = [
  { n: '01', t: 'Asciugatura', d: 'I melari pieni riposano qualche giorno nella stanza di deumidificazione, finché l\'umidità del miele scende sotto il 18%.', k: '<18%' },
  { n: '02', t: 'Disopercolatura', d: 'Si toglie il sottile strato di cera, l\'opercolo, che le api usano per sigillare ogni cella piena.', k: 'cera' },
  { n: '03', t: 'Smielatura', d: 'Lo smielatore centrifuga i favi: in pochi minuti il miele esce e i favi tornano alle api per il raccolto successivo.', k: 'giri' },
  { n: '04', t: 'Decantazione', d: 'Filtrato a setaccio, il miele riposa nei maturatori d\'acciaio inox finché le bollicine d\'aria salgono in superficie.', k: 'inox' },
  { n: '05', t: 'In vasetto', d: 'Invasettato, etichettato e pronto. Tutto a freddo, con la prassi igienica HACCP, senza mai scaldare il miele.', k: 'a freddo' },
]

export const ROOMS = [
  { id: 'azzurra', n: 'Azzurra', c: '#6FA3C7', tone: 'azzurro e avorio', d: 'Molto luminosa: dalla finestra sulle montagne entra il tramonto con i suoi colori caldi.', bed: 'Matrimoniale o doppia' },
  { id: 'rossa', n: 'Rossa', c: '#C2483D', tone: 'rosso caldo', d: 'Due porte-finestre, una anche nel bagno, affacciate sulle Alpi da cui guardare il sole che tramonta.', bed: 'Solo matrimoniale' },
  { id: 'verde', n: 'Verde', c: '#6E9B5A', tone: 'verde e bianco panna', d: 'Il sole del mattino entra dalla porta-finestra: la camera giusta per chi si sveglia presto.', bed: 'Matrimoniale o doppia' },
]

export const SERVICES = [
  'Colazione inclusa nel punto ristoro', 'Bagno privato con doccia', 'Aria condizionata', 'Wi-Fi gratuito',
  'Parcheggio recintato', 'Moto e bici al coperto', 'Cani di piccola taglia benvenuti', 'Pulizia quotidiana',
]

export const AROUND = [
  { n: 'Racconigi', d: 'Il Castello Reale, residenza estiva di Casa Savoia.' },
  { n: 'Saluzzo', d: 'Uno splendido borgo medievale piemontese.' },
  { n: 'Fossano', d: 'Il castello dei Principi d\'Acaja sulla collina.' },
  { n: 'Bra e Alba', d: 'Storia, tartufo e grandi vini delle Langhe.' },
]

export const PRODUCTS = [
  { n: 'Drops al miele', d: 'Caramelle ripiene di un artigiano caramellaio: miele, eucalipto, propoli, latte e miele.' },
  { n: 'Polline', d: 'Raccolto all\'ingresso dell\'alveare, cambia colore secondo i fiori. Vasetto da 230 g.' },
  { n: 'Propoli', d: 'In tintura alcolica o in gocce analcoliche, adatte anche ai bambini. 30 ml.' },
]
