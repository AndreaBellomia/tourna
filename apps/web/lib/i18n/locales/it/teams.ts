const teams = {
  nav: {
    dashboard: 'Dashboard',
    teams: 'Team',
    logout: 'Esci',
  },
  metadata: {
    title: 'Team',
    description: 'Cerca, crea e gestisci i team di Tourna.',
  },
  list: {
    eyebrow: 'Team workspace',
    title: 'Team',
    description: 'Trova team pubblici, crea nuove squadre e prepara gestione utenti e permessi.',
    search: 'Cerca team',
    searchPlaceholder: 'Nome, slug o descrizione',
    visibility: 'Visibilita',
    allVisibilities: 'Tutte',
    create: 'Crea team',
    reset: 'Reset',
    loadMore: 'Carica altri',
    loading: 'Caricamento team',
    emptyTitle: 'Nessun team trovato',
    emptyDescription: 'Modifica la ricerca oppure crea il primo team.',
    unavailable:
      "Non riesco a raggiungere l'API team. La pagina resta pronta e si popola appena il backend risponde.",
  },
  form: {
    title: 'Nuovo team',
    description: 'Crea una squadra base; logo e asset arriveranno con il modello media.',
    name: 'Nome',
    namePlaceholder: 'Aurora Rivals',
    summary: 'Descrizione',
    summaryPlaceholder: 'Ruolo, disciplina, obiettivo competitivo...',
    visibility: 'Visibilita',
    submit: 'Crea',
    success: 'Team creato',
    invalid: 'Controlla i campi evidenziati.',
    failed: 'Creazione non riuscita.',
  },
  detail: {
    back: 'Torna ai team',
    overview: 'Profilo',
    settings: 'Impostazioni',
    members: 'Utenti',
    permissions: 'Permessi',
    status: 'Stato',
    created: 'Creato',
    editTitle: 'Modifica team',
    editDescription: 'Endpoint non ancora disponibile: il form e gia predisposto.',
    membersTitle: 'Lista utenti',
    membersDescription:
      'La sezione e pronta per collegare ruoli, inviti e trasferimenti quando gli endpoint saranno esposti.',
    permissionsTitle: 'Trasferimento permessi',
    permissionsDescription:
      'Azioni owner/captain disabilitate fino alla disponibilita dei contract dedicati.',
    disabledAction: 'In arrivo',
  },
  visibility: {
    private: 'Privato',
    unlisted: 'Non indicizzato',
    public: 'Pubblico',
  },
} as const

export default teams
