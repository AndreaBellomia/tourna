const users = {
  metadata: {
    title: 'Utenti',
    description: 'Cerca profili utente pubblici su Tourna.',
  },
  list: {
    eyebrow: 'Community',
    title: 'Utenti',
    description: 'Trova player, coach e organizer tramite nome o descrizione pubblica.',
    search: 'Cerca utenti',
    searchPlaceholder: 'Nome o descrizione',
    reset: 'Reset',
    loadMore: 'Carica altri',
    emptyTitle: 'Nessun utente trovato',
    emptyDescription: 'Modifica la ricerca o torna piu tardi.',
    unavailable:
      "Non riesco a raggiungere l'API utenti. La pagina si popola appena il backend risponde.",
  },
  detail: {
    back: 'Torna agli utenti',
    overview: 'Profilo',
    joined: 'Iscritto',
    emptyBio: 'Questo utente non ha ancora pubblicato una descrizione.',
  },
} as const

export default users
