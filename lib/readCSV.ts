import CSVStreamReader from './stream'
import Pipeline from './pipeline'

import CSVReaderUtil from './utils'
import Filtered from './filtered'
import {
  AliasMap,
  FilterFunction,
  ReadCSVOptions,
  PipelineFunction,
  PredicateFunction,
  NextStrategy
} from './models'

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

function MAP_ALIAS_PIPELINE<T> (alias: AliasMap): PipelineFunction<T> {
  return (data) => {
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
export default class CSVReader<T, E = T> {
  private filePath: string
  private options: ReadCSVOptions<T, E>
  private data: E[]
  private currentRow: number
  private readableRows: number
  private headers: string[]
  private nativeHeaders: string[]
  private pipeline: Pipeline<T>
  private filtered: Filtered<E>

  private static HEADER_LINE = 0

  public constructor (filePath: string, options?: ReadCSVOptions<T, E>) {
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
    if (this.options.alias) {
      this.pipeline.pipe(MAP_ALIAS_PIPELINE<T>(this.options.alias))
    }

    if (this.options.map) {
      const map = this.options.map
      this.pipeline.pipe((data, index) => map(data, index) as unknown as T)
    }

    if (this.options.skipLines) {
      this.filtered.addPredicate(SKIP_LINES_PREDICATE<E>(this.options.skipLines))
    }
    if (this.options.limit) {
      this.filtered.addPredicate(LIMIT_PREDICATE<E>(this.options.limit))
    }
    if (this.options.filter) {
      this.filtered.addPredicate(FILTER_PREDICATE<E>(this.options.filter))
    }
  }

  private resetMetaData (): void {
    this.currentRow = 0
    this.readableRows = 0
  }

  public async read (): Promise<E[]> {
    this.resetMetaData()
    this.data = []
    await CSVStreamReader.readAsync(this.filePath, {
      onNextLine: (line) => {
        if (this.currentRow === CSVReader.HEADER_LINE) {
          this.processHeader(line)
          return true
        } else {
          const simpleData = CSVReaderUtil.mapRowToSimpleObject<T>(line, this.nativeHeaders)
          const pipeData: E = this.pipeline.process(simpleData) as unknown as E
          const filteredStatus = this.filtered.process(pipeData, this.readableRows, this.currentRow)
          return this.processData(filteredStatus, pipeData)
        }
      }
    })

    return this.data as unknown as E[]
  }

  private async reduce<K> (acc: K | undefined, f: (acc: K | undefined, data: E, index: number) => K): Promise<K | undefined> {
    this.resetMetaData()
    await CSVStreamReader.readAsync(this.filePath, {
      onNextLine: (line) => {
        if (this.currentRow === CSVReader.HEADER_LINE) {
          this.processHeader(line)
          return true
        } else {
          const simpleData = CSVReaderUtil.mapRowToSimpleObject<T>(line, this.nativeHeaders)
          const pipeData: E = this.pipeline.process(simpleData) as unknown as E
          const filteredStatus = this.filtered.process(pipeData, this.readableRows, this.currentRow)
          if (filteredStatus === NextStrategy.STOP) {
            return false
          }
          if (filteredStatus === NextStrategy.NEXT) {
            this.nextLine()
            return true
          }
          this.consumerLine()
          acc = f(acc, pipeData, this.currentRow)
          return true
        }
      }
    })
    return acc
  }

  public async min (column: string): Promise<number | undefined> {
    const min = await this.reduce<number>(undefined, (acc, data) => {
      const currentValue = Number((data as any)[column])
      if (acc) {
        if (currentValue < acc) {
          return currentValue
        }

        return acc
      }
      return currentValue
    })
    return min
  }

  public async max (column: string): Promise<number | undefined> {
    const max = await this.reduce<number>(undefined, (acc, data) => {
      const currentValue = Number((data as any)[column])
      if (acc) {
        if (currentValue > acc) {
          return currentValue
        }

        return acc
      }
      return currentValue
    })
    return max
  }

  public async sum (column: string): Promise<number | undefined> {
    const sum = await this.reduce<number>(undefined, (acc, data) => {
      const currentValue = Number((data as any)[column])
      if (acc) {
        return acc + currentValue
      }
      return currentValue
    })
    return sum
  }

  public async avg (column: string): Promise<number | undefined> {
    const sum = await this.sum(column)
    if (sum) {
      return sum / (this.readableRows - 1)
    }
    return undefined
  }

  private processData (strategy: NextStrategy, newData: E): boolean {
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

  public get csvData (): E[] {
    return this.data
  }
}
