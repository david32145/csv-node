export type FilterFunction<T> = (data: T, index: number) => boolean
export type PipelineFunction<T> = (value: T, index: number) => T
export type PredicateFunction<T> = (value: T, linesReadable: number, currentLine: number) => NextStrategy
export type MapFunction<T, E> = (value: T, index: number) => E
export interface ReadCSVOptions<T, E> {
  alias?: {[property: string]: string}
  skipLines?: number
  limit?: number
  delimiter?: string
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
