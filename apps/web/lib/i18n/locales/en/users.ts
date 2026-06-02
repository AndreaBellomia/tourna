const users = {
  metadata: {
    title: 'Users',
    description: 'Search public Tourna user profiles.',
  },
  list: {
    eyebrow: 'Community',
    title: 'Users',
    description: 'Find players, coaches, and organizers by public name or bio.',
    search: 'Search users',
    searchPlaceholder: 'Name or bio',
    reset: 'Reset',
    loadMore: 'Load more',
    emptyTitle: 'No users found',
    emptyDescription: 'Change the search or check back later.',
    unavailable: 'The users API is unreachable. This page will populate once the backend responds.',
  },
  detail: {
    back: 'Back to users',
    overview: 'Profile',
    joined: 'Joined',
    emptyBio: 'This user has not published a bio yet.',
  },
} as const

export default users
