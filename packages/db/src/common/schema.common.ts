import { ColumnType, Generated } from 'kysely'

export type DbId = Generated<string>

export type CreatedAtColumn = ColumnType<Date, Date | undefined, never>

export type UpdatedAtColumn = ColumnType<Date, Date | undefined, Date | undefined>

export type NullableColumn<T> = ColumnType<T | null, T | null | undefined, T | null>

export type JsonColumn<T = unknown> = ColumnType<T, T | undefined, T>

export interface BaseAttributeSchema {
  created_at: CreatedAtColumn
  updated_at: UpdatedAtColumn
}
