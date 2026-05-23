import { type Locale } from "./config"

const it = {
  metadata: {
    appName: "Tourna",
    template: "%s | Tourna",
    description: "Piattaforma per organizzare tornei esport e sportivi con dati live.",
    loginTitle: "Login",
    loginDescription: "Accedi o registrati a Tourna per organizzare tornei esport e sportivi.",
    dashboardTitle: "Dashboard",
    dashboardDescription: "Dashboard organizzatore Tourna.",
  },
  auth: {
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
  },
  loginPage: {
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
  },
  dashboard: {
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
  },
}

const en: Messages = {
  metadata: {
    appName: "Tourna",
    template: "%s | Tourna",
    description: "Platform for running esport and sport tournaments with live data.",
    loginTitle: "Login",
    loginDescription: "Sign in or create a Tourna account to run esport and sport tournaments.",
    dashboardTitle: "Dashboard",
    dashboardDescription: "Tourna organizer dashboard.",
  },
  auth: {
    badge: "Protected account",
    version: "v0.1",
    login: {
      tab: "Login",
      title: "Enter the lobby",
      description: "Resume managing tournaments, teams, and live brackets.",
      action: "Sign in",
    },
    signup: {
      tab: "Sign up",
      title: "Create your account",
      description: "Open the organizer panel and prepare your first tournament.",
      action: "Create account",
    },
    fields: {
      email: "Email",
      emailPlaceholder: "organizer@tourna.gg",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
    },
    errors: {
      invalidData: "Check the data you entered.",
      invalidCredentials: "Invalid credentials.",
      requestFailed: "We could not complete the request.",
      email: "Enter a valid email address.",
      password: "Password must be at least 8 characters.",
    },
  },
  loginPage: {
    product: "Tournament OS",
    liveReady: "Live-ready",
    eyebrow: "Brackets, rankings, and match center in real time",
    title: "Run esport and sport tournaments from one solid operations panel.",
    description:
      "A scalable base for organizers, teams, and referees: secure authentication, shared contracts, and live-data-ready pages without giving up SEO.",
    matchMonitor: "Match monitor",
    bracketFlow: "Bracket flow",
    bracket: {
      winner: "Winner",
      final: "Final",
    },
    liveMatches: [
      { game: "Valorant", stage: "Semi-final", teams: "NOVA vs Arcadia", score: "11 - 9" },
      { game: "Rocket League", stage: "Upper bracket", teams: "Pulse vs Drift", score: "3 - 2" },
      { game: "Basket 3x3", stage: "Group A", teams: "Milan vs Turin", score: "18 - 14" },
    ],
  },
  dashboard: {
    product: "Organizer dashboard",
    logout: "Sign out",
    stats: {
      tournaments: "Active tournaments",
      liveMatches: "Live matches",
      session: "Session",
    },
    setupBadge: "Initial setup",
    title: "Organizer area ready",
    description:
      "The session is active. Tournaments, brackets, schedules, realtime match center, and staff permissions can be attached from here.",
    sessionFallback: "session:pending",
  },
}

export type Messages = typeof it

export function getMessages(locale: Locale): Messages {
  return locale === "en" ? en : it
}
