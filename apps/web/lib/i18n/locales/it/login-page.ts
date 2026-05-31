const loginPage = {
  product: "Tournament OS",
  liveReady: "Live-ready",
  eyebrow: "Bracket, ranking e match center in tempo reale",
  title: "Gestisci tornei esport e sportivi con un pannello operativo solido.",
  description:
    "Una base scalabile per organizzatori, team e arbitri: autenticazione sicura, contratti condivisi e pagine pronte per dati live senza rinunciare alla SEO.",
  matchMonitor: "Match monitor",
  bracketFlow: "Bracket flow",
  bracket: {
    winner: "Winner",
    final: "Final",
  },
  liveMatches: [
    { game: "Valorant", stage: "Semi-final", teams: "NOVA vs Arcadia", score: "11 - 9" },
    { game: "Rocket League", stage: "Upper bracket", teams: "Pulse vs Drift", score: "3 - 2" },
    { game: "Basket 3x3", stage: "Group A", teams: "Milano vs Torino", score: "18 - 14" },
  ],
} as const

export default loginPage
