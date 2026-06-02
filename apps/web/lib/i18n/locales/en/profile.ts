const profile = {
  metadata: {
    title: 'Profile',
    description: 'Update your public identity, avatar, and Markdown bio.',
  },
  form: {
    eyebrow: 'Personal profile',
    title: 'Manage profile',
    description: 'These details power your public user page.',
    displayName: 'Display name',
    displayNamePlaceholder: 'Andrea Bellomia',
    bio: 'Markdown description',
    bioPlaceholder: '## Player profile\n\nRoles, favorite games, availability, and notes.',
    email: 'Account email',
    avatar: 'Avatar',
    avatarHelp: 'PNG, JPG, or WebP up to 4 MB.',
    upload: 'Upload avatar',
    removeAvatar: 'Remove avatar',
    save: 'Save profile',
    saved: 'Profile updated',
    failed: 'Could not update profile.',
    invalid: 'Check the highlighted fields.',
    uploadFailed: 'Avatar upload failed.',
    editMode: 'Edit',
    previewMode: 'Preview',
    emptyPreview: 'Write Markdown to preview it here.',
    publicProfile: 'View public profile',
  },
} as const

export default profile
