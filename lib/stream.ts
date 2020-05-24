import fs from 'fs'
import readline from 'readline'
import { CSVNotFound } from './erros'

interface CSVStreamReaderOptions {
  onNextLine: (line: string) => boolean,
  onError?: (err: Error) => void | Error
}

class CSVStreamReader {
  public async readAsync (filePath: string, opt: CSVStreamReaderOptions): Promise<void> {
    const fileStream = fs.createReadStream(filePath)
    const lineStream = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    return new Promise<void>((resolve, reject) => {
      lineStream.addListener('line', (line) => {
        if (!opt.onNextLine(line)) {
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
