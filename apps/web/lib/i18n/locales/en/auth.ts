const auth = {
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
} as const

export default auth
