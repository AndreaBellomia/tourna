const teams = {
  nav: {
    dashboard: 'Dashboard',
    teams: 'Teams',
    logout: 'Sign out',
  },
  metadata: {
    title: 'Teams',
    description: 'Search, create, and manage Tourna teams.',
  },
  list: {
    eyebrow: 'Team workspace',
    title: 'Teams',
    description:
      'Find public teams, create new squads, and prepare user and permission management.',
    search: 'Search teams',
    searchPlaceholder: 'Name, slug, or description',
    visibility: 'Visibility',
    allVisibilities: 'All',
    create: 'Create team',
    reset: 'Reset',
    loadMore: 'Load more',
    loading: 'Loading teams',
    emptyTitle: 'No teams found',
    emptyDescription: 'Change the search or create the first team.',
    unavailable:
      'The team API is unreachable. This page is ready and will populate once the backend responds.',
  },
  form: {
    title: 'New team',
    description: 'Create a base squad; logos and assets will arrive with the media model.',
    name: 'Name',
    namePlaceholder: 'Aurora Rivals',
    summary: 'Description',
    summaryPlaceholder: 'Role, discipline, competitive goal...',
    visibility: 'Visibility',
    submit: 'Create',
    success: 'Team created',
    invalid: 'Check the highlighted fields.',
    failed: 'Could not create the team.',
  },
  detail: {
    back: 'Back to teams',
    overview: 'Profile',
    settings: 'Settings',
    members: 'Users',
    permissions: 'Permissions',
    status: 'Status',
    created: 'Created',
    editTitle: 'Edit team',
    editDescription: 'Endpoint not available yet: the form is already prepared.',
    membersTitle: 'User list',
    membersDescription:
      'This section is ready to connect roles, invitations, and transfers when the endpoints are exposed.',
    permissionsTitle: 'Permission transfer',
    permissionsDescription:
      'Owner/captain actions are disabled until dedicated contracts are available.',
    disabledAction: 'Coming soon',
  },
  visibility: {
    private: 'Private',
    unlisted: 'Unlisted',
    public: 'Public',
  },
} as const

export default teams
