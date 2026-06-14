const dashboard = {
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
  shortcuts: {
    teams: "Open the team directory, review squads, and manage teams you own.",
    users: "Find public player, coach, and organizer profiles.",
    settings: "Update your public profile, avatar, and account-facing details.",
    tournaments:
      "Tournament operations will appear here when tournament contracts are connected.",
  },
  invitations: {
    emptyTitle: "No pending invitations",
    emptyDescription:
      "Team and tournament invitations will appear here once the backend exposes an invitation inbox.",
    browseTeams: "Browse teams",
  },
} as const

export default dashboard
