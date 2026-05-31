import { buildFinalObjectKey, buildTemporaryObjectKey, sanitizeFilename } from './storage.keys'

describe('storage keys', () => {
  it('builds stable temporary object keys', () => {
    expect(buildTemporaryObjectKey('Upload 123', '../Team Logo.PNG')).toBe(
      'tmp/upload-123/team-logo.png',
    )
  })

  it('builds final keys with visibility, asset type, owner scope, date, and asset id', () => {
    expect(
      buildFinalObjectKey({
        visibility: 'public',
        assetType: 'tournament_banner',
        ownerScope: 'Tournament 42',
        assetId: 'Banner 7',
        filename: 'Hero Image.JPG',
        now: new Date('2026-05-31T12:00:00.000Z'),
      }),
    ).toBe('public/tournament_banner/tournament-42/2026/05/banner-7/hero-image.jpg')
  })

  it('falls back to a safe filename', () => {
    expect(sanitizeFilename('////')).toBe('file')
  })
})
