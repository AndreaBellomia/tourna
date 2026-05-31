import {
  DisciplineTable,
  UserTable,
  MembershipTable,
  EventTable,
  MatchTable,
  MatchLineupTable,
  MatchLineupMemberTable,
  MatchParticipantTable,
  OrganizationTable,
  ResultConfirmationTable,
  ResultEvidenceTable,
  ResultSubmissionTable,
  ScopeConstraintTable,
  ScoreAwardTable,
  ScoringProfileTable,
  StageTable,
  StandingTable,
  StatDefinitionTable,
  StatEventTable,
  TagTable,
  TeamTable,
  TeamMembershipTable,
  TournamentTable,
  TournamentEntrantTable,
  TournamentRosterTable,
  TournamentRosterMemberTable,
  TournamentTagTable,
} from './schemas'

export interface DatabaseSchema {
  disciplines: DisciplineTable

  events: EventTable

  matches: MatchTable
  match_lineups: MatchLineupTable
  match_lineup_members: MatchLineupMemberTable
  match_participants: MatchParticipantTable

  memberships: MembershipTable

  organizations: OrganizationTable

  result_confirmations: ResultConfirmationTable
  result_evidence: ResultEvidenceTable
  result_submissions: ResultSubmissionTable

  scope_constraints: ScopeConstraintTable
  score_awards: ScoreAwardTable
  scoring_profiles: ScoringProfileTable

  stages: StageTable

  standings: StandingTable

  stat_definitions: StatDefinitionTable
  stat_events: StatEventTable

  tags: TagTable
  teams: TeamTable
  team_memberships: TeamMembershipTable
  tournaments: TournamentTable
  tournament_entrants: TournamentEntrantTable
  tournament_rosters: TournamentRosterTable
  tournament_roster_members: TournamentRosterMemberTable
  tournament_tags: TournamentTagTable

  users: UserTable
}
