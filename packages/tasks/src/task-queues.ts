export const TOURNA_TASK_QUEUES = {
  notifications: 'tourna.notifications',
  reports: 'tourna.reports',
  ratings: 'tourna.ratings',
  maintenance: 'tourna.maintenance',
} as const

export type TournaTaskQueueName = (typeof TOURNA_TASK_QUEUES)[keyof typeof TOURNA_TASK_QUEUES]
