import { ColumnType } from 'kysely'

export interface BaseAttributeSchema {
  createdAt: ColumnType<Date, never, never>
  updatedAt: ColumnType<Date, never, never>
}
