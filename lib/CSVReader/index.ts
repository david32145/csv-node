import CSVStream, { CSVNextLineResult } from '../stream'
import Pipeline from '../pipeline'

import CSVUtil from '../utils'
import Filtered from '../filtered'

import {
  CSVReadOptions,
  NextStrategy
} from '../models'

import {
  FILTER_PREDICATE,
  LIMIT_PREDICATE,
  MAP_ALIAS_PIPELINE,
  SKIP_LINES_PREDICATE
} from './util'

export default class CSVReader<T, E = T> {
  private _filePath: string
  private _options: CSVReadOptions<T, E>
  private _data: E[]
  private _currentRow: number
  private _readableRows: number
  private _headers: string[]
  private _nativeHeaders: string[]
  private _pipeline: Pipeline<T>
  private _filtered: Filtered<E>

  private static _HEADER_LINE = 0

  public constructor (filePath: string, options?: CSVReadOptions<T, E>) {
    this._filePath = CSVUtil.getAbsolutePath(filePath)
    this._options = options || {}
    this._data = []
    this._currentRow = 0
    this._readableRows = 0
    this._headers = []
    this._nativeHeaders = []
    this._pipeline = new Pipeline()
    this._filtered = new Filtered()
    this.init()
  }

  private init (): void {
    if (this._options.alias) {
      this._pipeline.pipe(MAP_ALIAS_PIPELINE<T>(this._options.alias))
    }

    if (this._options.map) {
      const map = this._options.map
      this._pipeline.pipe((data, index) => map(data, index) as unknown as T)
    }

    if (this._options.skipLines) {
      this._filtered.addPredicate(SKIP_LINES_PREDICATE<E>(this._options.skipLines))
    }
    if (this._options.limit) {
      this._filtered.addPredicate(LIMIT_PREDICATE<E>(this._options.limit))
    }
    if (this._options.filter) {
      this._filtered.addPredicate(FILTER_PREDICATE<E>(this._options.filter))
    }
  }

  private resetMetaData (): void {
    this._currentRow = 0
    this._readableRows = 0
  }

  public async read (): Promise<E[]> {
    this.resetMetaData()
    this._data = []
    await CSVStream.readAsync(this._filePath, {
      onNextLine: this.readCallback.bind(this)
    })
    return this._data as unknown as E[]
  }

  private readCallback ({ data }: CSVNextLineResult): boolean {
    if (this._currentRow === CSVReader._HEADER_LINE) {
      this.processHeader(data)
      return true
    } else {
      const simpleData = CSVUtil.mapRowToSimpleObject<T>(data, this._nativeHeaders, this._options.delimiter, this._options.castNumbers, this._options.castBooleans)
      const pipeData: E = this._pipeline.process(simpleData) as unknown as E
      const filteredStatus = this._filtered.process(pipeData, this._readableRows, this._currentRow)
      return this.processData(filteredStatus, pipeData)
    }
  }

  private async reduce<K> (acc: K | undefined, f: (acc: K | undefined, data: E, index: number) => K): Promise<K | undefined> {
    this.resetMetaData()
    await CSVStream.readAsync(this._filePath, {
      onNextLine: ({ data }) => {
        if (this._currentRow === CSVReader._HEADER_LINE) {
          this.processHeader(data)
          return true
        } else {
          const simpleData = CSVUtil.mapRowToSimpleObject<T>(data, this._nativeHeaders)
          const pipeData: E = this._pipeline.process(simpleData) as unknown as E
          const filteredStatus = this._filtered.process(pipeData, this._readableRows, this._currentRow)
          if (filteredStatus === NextStrategy.STOP) {
            return false
          }
          if (filteredStatus === NextStrategy.NEXT) {
            this.nextLine()
            return true
          }
          this.consumerLine()
          acc = f(acc, pipeData, this._currentRow)
          return true
        }
      }
    })
    return acc
  }

  /**
   *
   * @param {string} column column to be calculate min
   *
   * @returns the min of an column with *options* passed in constructor
   */
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

  /**
   *
   * @param {string} column column to be calculate max
   *
   * @returns the max of an column with *options* passed in constructor
   */
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

  /**
   *
   * @param {string} column column to be calculate sum
   *
   * @returns the sum of an column with *options* passed in constructor
   */
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

  /**
   *
   * @param {string} column column to be calculate avg
   *
   * @returns the average of an column with *options* passed in constructor
   */
  public async avg (column: string): Promise<number | undefined> {
    const sum = await this.sum(column)
    if (sum) {
      return sum / (this._readableRows - 1)
    }
    return undefined
  }

  /**
   *
   * @param {NextStrategy} strategy how process data
   * @param {E} newData new item
   *
   * if strategy is for stop, the reader is stoper,
   * if strategy is for next, so skip this line,
   *
   * else, so consumer this line and add *newData* to *_data*
   */
  private processData (strategy: NextStrategy, newData: E): boolean {
    if (strategy === NextStrategy.STOP) {
      return false
    }

    if (strategy === NextStrategy.NEXT) {
      this.nextLine()
      return true
    }

    this._data.push(newData)
    this.consumerLine()
    return true
  }

  /**
   *
   * @param {string} headerLine is the header of csv table like string
   *
   * Process the header and fill the variable *_headers*
   */
  private processHeader (headerLine: string) {
    this._nativeHeaders = CSVUtil.splitHeader(headerLine, this._options.delimiter)
    this._headers = CSVUtil.mapNativeHeaderToHeader(this._nativeHeaders, this._options.alias)
    this.consumerLine()
  }

  /**
   * Consume an line and increment readableRows and currentRow
   */
  private consumerLine (): void {
    this._readableRows = this._readableRows + 1
    this.nextLine()
  }

  /**
   * Increment one line
   */
  private nextLine (): void {
    this._currentRow = this._currentRow + 1
  }

  /**
   * Getter for *headers*
   */
  public get headers (): string[] {
    return this._headers
  }

  /**
   * Getter for *nativeHeaders*
   *
   * *nativeHeaders* is the original headers in
   * csv table.
   */
  public get nativeHeaders (): string[] {
    return this._nativeHeaders
  }

  /**
   * Getter for *data*
   *
   * *data* is the rows as javascript object.
   */
  public get data (): E[] {
    return this._data
  }
}
