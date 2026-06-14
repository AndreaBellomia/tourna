const dashboard = {
  product: "Organizer dashboard",
  logout: "Esci",
  stats: {
    tournaments: "Tornei attivi",
    liveMatches: "Match live",
    session: "Sessione",
  },
  setupBadge: "Setup iniziale",
  title: "Area organizzatore pronta",
  description:
    "La sessione e attiva. Da qui si possono innestare tornei, bracket, calendario, realtime match center e permessi per team e staff.",
  sessionFallback: "session:pending",
  shortcuts: {
    teams: "Apri la directory dei team, controlla le squadre e gestisci i team che possiedi.",
    users: "Trova profili pubblici di player, coach e organizzatori.",
    settings: "Aggiorna profilo pubblico, avatar e dettagli account.",
    tournaments:
      "Le operazioni torneo appariranno qui quando i contratti torneo saranno collegati.",
  },
  invitations: {
    emptyTitle: "Nessun invito in sospeso",
    emptyDescription:
      "Gli inviti a team e tornei appariranno qui quando il backend esporra una inbox inviti.",
    browseTeams: "Esplora team",
  },
} as const

export default dashboard
