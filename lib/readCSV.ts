import CSVStreamReader from './stream'
import Pipeline, { PipelineFunction } from './pipeline'

import CSVReaderUtil from './utils'
import Filtered, { PredicateFunction, NextStrategy } from './filtered'

type FilterFunction<T> = (data: T, index: number) => boolean

export interface ReadCSVOptions<T> {
  alias?: {[property: string]: string}
  skipLines?: number
  limit?: number
  delimiter?: string
  filter?: FilterFunction<T>
}

export interface AliasMap {
  [property: string]: string
}

function SKIP_LINES_PREDICATE<T> (skipLines: number): PredicateFunction<T> {
  return (data, linesReadable, currentLine) => {
    if (currentLine <= skipLines) {
      return NextStrategy.NEXT
    }
    return NextStrategy.PROCESS
  }
}

function LIMIT_PREDICATE<T> (limit: number): PredicateFunction<T> {
  return (data, linesReadable) => {
    if (limit < linesReadable) {
      return NextStrategy.STOP
    }
    return NextStrategy.PROCESS
  }
}

function FILTER_PREDICATE<T> (filter: FilterFunction<T>): PredicateFunction<T> {
  return (data, linesReadable, currentLine) => {
    if (filter(data, currentLine)) {
      return NextStrategy.PROCESS
    }
    return NextStrategy.NEXT
  }
}

function MAP_ALIAS_PIPELINE<T> (alias?: AliasMap): PipelineFunction<T> {
  return (data) => {
    const dataKeys = Object.keys(data)
    return dataKeys.reduce((acc, dataKey) => {
      let keyName = dataKey
      if (alias) {
        if (alias[dataKey]) {
          keyName = alias[dataKey]
        }
      }
      acc[keyName] = (data as any)[dataKey]
      return acc
    }, {} as any) as T
  }
}

export default class CSVReader<T> {
  private filePath: string
  private options: ReadCSVOptions<T>
  private data: T[]
  private currentRow: number
  private readableRows: number
  private headers: string[]
  private nativeHeaders: string[]
  private pipeline: Pipeline<T>
  private filtered: Filtered<T>

  private static HEADER_LINE = 0

  public constructor (filePath: string, options?: ReadCSVOptions<T>) {
    this.filePath = CSVReaderUtil.getAbsolutePath(filePath)
    this.options = options || {}
    this.data = []
    this.currentRow = 0
    this.readableRows = 0
    this.headers = []
    this.nativeHeaders = []
    this.pipeline = new Pipeline()
    this.filtered = new Filtered()
    this.init()
  }

  private init (): void {
    this.pipeline.pipe(MAP_ALIAS_PIPELINE<T>(this.options.alias))

    if (this.options.skipLines) {
      this.filtered.addPredicate(SKIP_LINES_PREDICATE<T>(this.options.skipLines))
    }
    if (this.options.limit) {
      this.filtered.addPredicate(LIMIT_PREDICATE<T>(this.options.limit))
    }
    if (this.options.filter) {
      this.filtered.addPredicate(FILTER_PREDICATE<T>(this.options.filter))
    }
  }

  public async read (): Promise<T[]> {
    await CSVStreamReader.readAsync(this.filePath, {
      onNextLine: (line) => {
        if (this.currentRow === CSVReader.HEADER_LINE) {
          this.processHeader(line)
          return true
        } else {
          const simpleData = CSVReaderUtil.mapRowToSimpleObject<T>(line, this.nativeHeaders)
          const pipeData: T = this.pipeline.process(simpleData)
          const filteredStatus = this.filtered.process(pipeData, this.readableRows, this.currentRow)
          return this.processData(filteredStatus, pipeData)
        }
      }
    })

    return this.data
  }

  private processData (strategy: NextStrategy, newData: T): boolean {
    if (strategy === NextStrategy.STOP) {
      return false
    }

    if (strategy === NextStrategy.NEXT) {
      this.nextLine()
      return true
    }

    this.data.push(newData)
    this.consumerLine()
    return true
  }

  private processHeader (headerLine: string) {
    this.nativeHeaders = CSVReaderUtil.splitHeader(headerLine, this.options.delimiter)
    this.headers = CSVReaderUtil.mapNativeHeaderToHeader(this.nativeHeaders, this.options.alias)
    this.consumerLine()
  }

  /**
   * Consume an line and increment readableRows and currentRow
   */
  private consumerLine (): void {
    this.readableRows = this.readableRows + 1
    this.nextLine()
  }

  /**
   * Increment one line
   */
  private nextLine (): void {
    this.currentRow = this.currentRow + 1
  }

  public get headersColumns (): string[] {
    return this.headers
  }

  public get nativeHeadersColumns (): string[] {
    return this.nativeHeaders
  }

  public get csvData (): T[] {
    return this.data
  }
}
