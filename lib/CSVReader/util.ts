import {
  AliasMap,
  FilterFunction,
  PipelineFunction,
  PredicateFunction,
  NextStrategy
} from '../models'

export function SKIP_LINES_PREDICATE<T> (skipLines: number): PredicateFunction<T> {
  return (data: T, linesReadable: number, currentLine: number): NextStrategy => {
    if (currentLine <= skipLines) {
      return NextStrategy.NEXT
    }
    return NextStrategy.PROCESS
  }
}

export function LIMIT_PREDICATE<T> (limit: number): PredicateFunction<T> {
  return (data: T, linesReadable: number): NextStrategy => {
    if (limit < linesReadable) {
      return NextStrategy.STOP
    }
    return NextStrategy.PROCESS
  }
}

export function FILTER_PREDICATE<T> (filter: FilterFunction<T>): PredicateFunction<T> {
  return (data: T, linesReadable: number, currentLine: number): NextStrategy => {
    if (filter(data, currentLine)) {
      return NextStrategy.PROCESS
    }
    return NextStrategy.NEXT
  }
}

export function MAP_ALIAS_PIPELINE<T> (alias: AliasMap): PipelineFunction<T> {
  return (data: T): T => {
    const dataKeys = Object.keys(data)
    return dataKeys.reduce((acc, dataKey) => {
      let keyName = dataKey
      if (alias[dataKey]) {
        keyName = alias[dataKey]
      }
      acc[keyName] = (data as any)[dataKey]
      return acc
    }, {} as any) as T
  }
}

export default {
  SKIP_LINES_PREDICATE,
  LIMIT_PREDICATE,
  FILTER_PREDICATE,
  MAP_ALIAS_PIPELINE
}
