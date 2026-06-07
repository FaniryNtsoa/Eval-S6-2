export type ID = string | number

export interface SelectOption<T = string> {
  label: string
  value: T
}

export type Nullable<T> = T | null
