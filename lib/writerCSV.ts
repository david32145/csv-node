import CSVStreamReader from './stream'

export interface CSVWriterOptions{
  headers: string[]
  delimiter?: string
}

export default class CSVWriter {
  private _fileName: string
  private options: CSVWriterOptions

  public constructor (fileName: string, options: CSVWriterOptions) {
    this._fileName = fileName
    this.options = options
  }

  public async write (data: Record<string, unknown>[]): Promise<void> {
    await CSVStreamReader.writeAsync(this._fileName, data, this.options.headers, this.options.delimiter)
  }
}
