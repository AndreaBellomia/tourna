'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Ban, LoaderCircle } from 'lucide-react'
import { Alert } from '@repo/ui/components/alert'
import { Badge } from '@repo/ui/components/badge'
import { Button } from '@repo/ui/components/button'
import { Card } from '@repo/ui/components/card'
import type {
  CursorPageInfo,
  TeamDetailResponse,
  TeamInvitationResponse,
} from '@repo/contracts'
import { EmptyState } from '~/features/common/components/empty-state'
import { useFormatters, useTranslations } from '~/lib/i18n/client'
import {
  fetchTeamInvitations,
  revokeTeamInvitation,
} from '~/features/teams/services/team-client'

const PAGE_SIZE = 20

type TeamInvitationPanelProps = {
  refreshToken?: number
  team: Pick<TeamDetailResponse, 'id'>
}

type DisplayInvitationStatus = TeamInvitationResponse['status'] | 'expired'

export function TeamInvitationPanel({
  refreshToken = 0,
  team,
}: TeamInvitationPanelProps) {
  const format = useFormatters()
  const t = useTranslations('teams')
  const [invitations, setInvitations] = useState<TeamInvitationResponse[]>([])
  const [pageInfo, setPageInfo] = useState<CursorPageInfo | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const requestVersionRef = useRef(0)

  useEffect(() => {
    let active = true
    const requestVersion = requestVersionRef.current + 1

    requestVersionRef.current = requestVersion
    setIsLoadingInitial(true)
    setError(null)

    void fetchTeamInvitations(team.id, {
      direction: 'next',
      limit: PAGE_SIZE,
    })
      .then((page) => {
        if (!active || requestVersion !== requestVersionRef.current) return

        setInvitations(page.data)
        setPageInfo(page.pageInfo)
      })
      .catch((loadError: unknown) => {
        if (!active || requestVersion !== requestVersionRef.current) return

        setError(loadError instanceof Error ? loadError.message : t('invites.loadFailed'))
      })
      .finally(() => {
        if (!active || requestVersion !== requestVersionRef.current) return

        setIsLoadingInitial(false)
      })

    return () => {
      active = false
    }
  }, [refreshToken, t, team.id])

  const loadNextPage = useCallback(async () => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor || isLoadingInitial || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)

    try {
      const page = await fetchTeamInvitations(team.id, {
        cursor: pageInfo.nextCursor,
        direction: 'next',
        limit: PAGE_SIZE,
      })

      setInvitations((current) => mergeInvitations(current, page.data))
      setPageInfo(page.pageInfo)
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : t('invites.loadFailed'))
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingInitial, isLoadingMore, pageInfo, t, team.id])

  useEffect(() => {
    const sentinel = sentinelRef.current

    if (!sentinel || !pageInfo?.hasNextPage || isLoadingInitial || isLoadingMore) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          void loadNextPage()
        }
      },
      { rootMargin: '240px' },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [isLoadingInitial, isLoadingMore, loadNextPage, pageInfo?.hasNextPage])

  async function handleRevoke(invitationId: string) {
    setNotice(null)
    setError(null)
    setRevokingId(invitationId)

    try {
      await revokeTeamInvitation(team.id, invitationId)
      setInvitations((current) =>
        current.map((invitation) =>
          invitation.id === invitationId ? { ...invitation, status: 'revoked' } : invitation,
        ),
      )
      setNotice(t('invites.revoked'))
    } catch (revokeError: unknown) {
      setError(revokeError instanceof Error ? revokeError.message : t('invites.revokeFailed'))
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <section className="space-y-4">
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">{t('invites.listTitle')}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {t('invites.listDescription')}
            </p>
          </div>
          <Badge variant="outline">{invitations.length}</Badge>
        </div>

        {notice ? <Alert>{notice}</Alert> : null}
        {error ? <Alert variant="destructive">{error}</Alert> : null}

        {isLoadingInitial && invitations.length === 0 ? (
          <LoadingState label={t('invites.loading')} />
        ) : invitations.length === 0 ? (
          <EmptyState
            description={t('invites.emptyDescription')}
            title={t('invites.emptyTitle')}
          />
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => {
              const displayStatus = getDisplayStatus(invitation)
              const isRevoking = revokingId === invitation.id
              const canRevoke = displayStatus === 'active'

              return (
                <Card key={invitation.id} className="space-y-4 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{t(`invites.roles.${invitation.role}`)}</Badge>
                        <Badge variant={statusBadgeVariant(displayStatus)}>
                          {statusLabel(displayStatus, t)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatUsage(invitation, {
                          limited: t('invites.useLimited', {
                            max: invitation.maxUses ?? undefined,
                            used: invitation.usedCount,
                          }),
                          unlimited: t('invites.useUnlimited', { used: invitation.usedCount }),
                        })}
                      </p>
                    </div>

                    <Button
                      disabled={!canRevoke || isRevoking}
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => void handleRevoke(invitation.id)}
                    >
                      {isRevoking ? (
                        <>
                          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                          {t('invites.revoking')}
                        </>
                      ) : (
                        <>
                          <Ban aria-hidden="true" className="size-4" />
                          {t('invites.revoke')}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-3">
                    <InvitationMeta
                      label={t('invites.createdAt')}
                      value={format.dateTime(invitation.createdAt)}
                    />
                    <InvitationMeta
                      label={t('invites.expiresAt')}
                      value={
                        invitation.expiresAt
                          ? format.dateTime(invitation.expiresAt)
                          : t('invites.neverExpires')
                      }
                    />
                    <InvitationMeta
                      label={t('invites.status')}
                      value={statusLabel(displayStatus, t)}
                    />
                  </div>
                </Card>
              )
            })}

            <div ref={sentinelRef} className="h-1" />

            {isLoadingMore ? <LoadingState label={t('invites.loading')} compact /> : null}
          </div>
        )}
      </Card>
    </section>
  )
}

function InvitationMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  )
}

function LoadingState({ compact = false, label }: { compact?: boolean; label: string }) {
  return (
    <div
      className={
        compact
          ? 'flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground'
          : 'flex min-h-40 items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/20 px-4 py-10 text-sm text-muted-foreground'
      }
    >
      <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
      {label}
    </div>
  )
}

function mergeInvitations(
  current: TeamInvitationResponse[],
  nextPage: TeamInvitationResponse[],
): TeamInvitationResponse[] {
  const byId = new Map(current.map((invitation) => [invitation.id, invitation]))

  for (const invitation of nextPage) {
    byId.set(invitation.id, invitation)
  }

  return Array.from(byId.values()).sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

function formatUsage(
  invitation: TeamInvitationResponse,
  labels: {
    limited: string
    unlimited: string
  },
) {
  if (invitation.maxUses === null) {
    return labels.unlimited
  }

  return labels.limited
}

function getDisplayStatus(invitation: TeamInvitationResponse): DisplayInvitationStatus {
  if (invitation.status === 'revoked') {
    return 'revoked'
  }

  if (invitation.expiresAt && new Date(invitation.expiresAt).getTime() <= Date.now()) {
    return 'expired'
  }

  return 'active'
}

function statusBadgeVariant(status: DisplayInvitationStatus) {
  if (status === 'revoked') return 'outline'
  if (status === 'expired') return 'destructive'

  return 'secondary'
}

function statusLabel(
  status: DisplayInvitationStatus,
  t: (key: 'invites.statusRevoked' | 'invites.statusExpired' | 'invites.statusActive') => string,
) {
  if (status === 'revoked') return t('invites.statusRevoked')
  if (status === 'expired') return t('invites.statusExpired')

  return t('invites.statusActive')
}
