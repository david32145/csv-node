import fs from 'fs'
import readline from 'readline'
import { CSVNotFound } from './erros'

interface CSVNextLineResult {
  data: string
}

interface CSVStreamReaderOptions {
  onNextLine: (result: CSVNextLineResult) => boolean,
  onError?: (err: Error) => void | Error
}

async function writeAsync (stream: fs.WriteStream, data: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    stream.write(data, err => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

class CSVStreamReader {
  public async writeAsync (filePath: string, rows: Record<string, unknown>[], header: string[], delimiter = ','): Promise<void> {
    const writeStream = fs.createWriteStream(filePath)
    const headerRow = header.join(delimiter) + '\n'
    await writeAsync(writeStream, headerRow)
    await Promise.all(rows.map(async row => {
      const values = Object.values<unknown>(row)
      await writeAsync(writeStream, values.join(delimiter) + '\n')
    }))

    writeStream.close()
  }

  public async readAsync (filePath: string, opt: CSVStreamReaderOptions): Promise<void> {
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

export default new CSVStreamReader()
