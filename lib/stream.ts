import fs from 'fs'
import readline from 'readline'
import CSVNotFound from './erros/CSVNotFound'

import { CSVWriterOptions } from './models'

export interface CSVNextLineResult {
  data: string
}

interface CSVStreamOptions {
  onNextLine: (result: CSVNextLineResult) => boolean,
  onError?: (err: Error) => void | Error
}

async function writeAsync (stream: fs.WriteStream, data: string): Promise<void> {
  return new Promise<void>((resolve) => {
    stream.write(data, () => resolve())
  })
}

type CSVEntry<T> = [keyof T, T[keyof T]][]

class CSVStream {
  public async writeAsync<T> (filePath: string, rows: T[], {
    headers,
    delimiter = ',',
    format = {}
  }: CSVWriterOptions<T>): Promise<void> {
    const writeStream = fs.createWriteStream(filePath)
    const headerRow = headers.join(delimiter) + '\n'
    await writeAsync(writeStream, headerRow)
    await Promise.all(rows.map(async row => {
      const entries = Object.entries(row) as unknown as CSVEntry<T>
      const mapValues = entries.map((entry) => {
        const formatFunction = format[entry[0]]
        if (formatFunction) {
          return formatFunction(entry[1])
        }
        return String(entry[1])
      })
      await writeAsync(writeStream, mapValues.join(delimiter) + '\n')
    }))

    writeStream.close()
  }

  public async readAsync (filePath: string, opt: CSVStreamOptions): Promise<void> {
    const fileStream = fs.createReadStream(filePath)
    const lineStream = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    return new Promise<void>((resolve, reject) => {
      lineStream.addListener('line', (line) => {
        if (!opt.onNextLine({ data: line })) {
          lineStream.close()
          resolve()
        }
      })
      fileStream.on('error', (err) => {
        if (opt.onError) opt.onError(err)
        return reject(new CSVNotFound(err, filePath))
      })

      lineStream.addListener('close', resolve)
    })
  }
}

export default new CSVStream()
