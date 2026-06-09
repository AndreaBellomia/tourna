const auth = {
  badge: "Account protetto",
  version: "v0.1",
  login: {
    tab: "Login",
    title: "Accedi alla lobby",
    description: "Riprendi la gestione di tornei, team e bracket live.",
    action: "Accedi",
  },
  signup: {
    tab: "Registrazione",
    title: "Crea il tuo account",
    description: "Apri il pannello organizzatore e prepara il primo torneo.",
    action: "Registrati",
  },
  fields: {
    email: "Email",
    emailPlaceholder: "organizer@tourna.gg",
    password: "Password",
    passwordPlaceholder: "Minimo 8 caratteri",
  },
  errors: {
    invalidData: "Controlla i dati inseriti.",
    invalidCredentials: "Credenziali non valide.",
    requestFailed: "Non siamo riusciti a completare la richiesta.",
    email: "Inserisci un indirizzo email valido.",
    password: "La password deve contenere almeno 8 caratteri.",
  },
  emailVerification: {
    metadataTitle: "Verifica email",
    metadataDescription: "Conferma l indirizzo email collegato al tuo account Tourna.",
    successTitle: "Email verificata",
    successDescription: "L email del tuo account ora e verificata.",
    failedTitle: "Link di verifica scaduto",
    failedDescription: "Richiedi una nuova email di verifica dal tuo profilo.",
    profileAction: "Apri profilo",
  },
} as const

export default auth
