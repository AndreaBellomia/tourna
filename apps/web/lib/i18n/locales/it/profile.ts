const profile = {
  metadata: {
    title: 'Profilo',
    description: 'Aggiorna identita pubblica, avatar e descrizione Markdown.',
  },
  form: {
    eyebrow: 'Profilo personale',
    title: 'Gestisci profilo',
    description: 'Questi dati alimentano la tua pagina utente pubblica.',
    displayName: 'Nome visualizzato',
    displayNamePlaceholder: 'Andrea Bellomia',
    nickname: 'Nickname',
    nicknamePlaceholder: 'andreab',
    bio: 'Descrizione Markdown',
    bioPlaceholder: '## Player profile\n\nRuoli, giochi preferiti, disponibilita e note.',
    email: 'Email account',
    avatar: 'Avatar',
    avatarHelp: 'PNG, JPG o WebP fino a 4 MB.',
    upload: 'Carica avatar',
    removeAvatar: 'Rimuovi avatar',
    save: 'Salva profilo',
    saved: 'Profilo aggiornato',
    failed: 'Aggiornamento non riuscito.',
    invalid: 'Controlla i campi evidenziati.',
    uploadFailed: 'Upload avatar non riuscito.',
    editMode: 'Edit',
    previewMode: 'Preview',
    emptyPreview: 'Scrivi Markdown per vedere qui l’anteprima.',
    publicProfile: 'Vedi profilo pubblico',
  },
} as const

export default profile
