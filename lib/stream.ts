import fs from "fs"
import readline from "readline"
import { CSVNotFound } from "./erros"

interface CSVStreamReaderOptions {
  onNextLine: (line: string) => boolean,
  onError?: (err: Error) => void
}

class CSVStreamReader{
  public async readAsync(filePath: string, opt: CSVStreamReaderOptions): Promise<void> {
    const fileStream = fs.createReadStream(filePath)
    const lineStream = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    return new Promise<void>((resolver, reject) => {
      lineStream.addListener("line", (line) => {
        if(!opt.onNextLine(line)){
          lineStream.close()
          resolver()
          return
        }
      })
      fileStream.on("error", (err) => {
        if(opt.onError) opt.onError(err)
        return reject(new CSVNotFound(err, filePath))
      })

      lineStream.addListener("close", resolver)
    })
  }
}

export default new CSVStreamReader()