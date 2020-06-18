export type FilterFunction<T> = (data: T, index: number) => boolean
export type PipelineFunction<T> = (value: T, index: number) => T
export type PredicateFunction<T> = (value: T, linesReadable: number, currentLine: number) => NextStrategy
export type MapFunction<T, E> = (value: T, index: number) => E
export interface CSVReadOptions<T, E> {
  alias?: {[property: string]: string}
  skipLines?: number
  limit?: number
  delimiter?: string
  castNumbers?: boolean
  castBooleans?: boolean
  filter?: FilterFunction<E>
  map?: MapFunction<T, E>
}

export interface AliasMap {
  [property: string]: string
}

export enum NextStrategy{
  // Next row
  NEXT,
  // Stop the process of read
  STOP,
  // Process the row
  PROCESS
}

export interface CSVWriterOptions<T>{
  headers: string[]
  delimiter?: string
  format?: Partial<{
    [P in keyof T]: (value: T[P]) => string
  }>
}
