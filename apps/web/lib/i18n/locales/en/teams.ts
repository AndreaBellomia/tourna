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
    eyebrow: 'Squads and clans',
    title: 'Teams',
    description:
      'Explore public teams, open team covers, and manage only the squads where you have an admin role.',
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
    eyebrow: 'Team editor',
    description: 'Create a base squad; logos and assets will arrive with the media model.',
    name: 'Name',
    namePlaceholder: 'Aurora Rivals',
    summary: 'Markdown description',
    summaryPlaceholder:
      '# Aurora Rivals\n\nCompetitive Valorant roster.\n\n- Weekly scrims\n- Open to tryouts',
    visibility: 'Visibility',
    submit: 'Create',
    save: 'Save',
    success: 'Team created',
    saved: 'Team updated',
    invalid: 'Check the highlighted fields.',
    failed: 'Could not create the team.',
    editMode: 'Edit',
    previewMode: 'Preview',
    emptyPreview: 'Write Markdown to preview the rendered content here.',
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
    editDescription: 'Update the public profile, visibility, and Markdown content.',
    emptyDescription: 'This team has not published a description yet.',
    membershipTitle: 'Current view',
    membershipDescription: 'You have management tools for this team.',
    publicDescription: 'You are viewing the public team cover.',
    publicViewer: 'Visitor',
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
