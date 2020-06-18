import CSVStreamReader from '../stream'

import { CSVWriterOptions } from '../models'

export default class CSVWriter<T> {
  private _fileName: string
  private options: CSVWriterOptions<T>

  public constructor (fileName: string, options: CSVWriterOptions<T>) {
    this._fileName = fileName
    this.options = options
  }

  public async write (data: T[]): Promise<void> {
    await CSVStreamReader.writeAsync(this._fileName, data, this.options)
  }
}
