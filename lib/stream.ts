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

class CSVStream {
  public async writeAsync<T> (filePath: string, rows: T[], {
    headers,
    defaultValue: deafultValue = {},
    delimiter = ',',
    format = {}
  }: CSVWriterOptions<T>): Promise<void> {
    const writeStream = fs.createWriteStream(filePath)
    const headerRow = Object.values(headers).join(delimiter) + '\n'
    await writeAsync(writeStream, headerRow)
    await Promise.all(rows.map(async row => {
      const orderColumns = Object.keys(headers) as unknown as Array<keyof T>
      const mapValues = orderColumns.map(column => {
        if (row[column]) {
          const formatFunction = format[column]
          if (formatFunction) {
            return formatFunction(row[column])
          }
          return String(row[column])
        }
        return deafultValue[column] || 'NULL'
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
