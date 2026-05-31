export const TOURNA_QUEUE_NAMES = {
  notifications: 'tourna.notifications',
  reports: 'tourna.reports',
  ratings: 'tourna.ratings',
  maintenance: 'tourna.maintenance',
} as const

export type TournaQueueName = (typeof TOURNA_QUEUE_NAMES)[keyof typeof TOURNA_QUEUE_NAMES]
