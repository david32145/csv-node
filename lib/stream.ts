import fs from "fs"
import readline from "readline"
import { CSVNotFound } from "./erros"

/**
 * @param onNextLine call always have an new line
 * 
 * always the reader have a new line, call onNextLine
 * with the new line value and line index.
 */
interface StreamReader {
  onNextLine: (line: string, index: number) => boolean,
  onError?: (err: string) => void
}

/**
 * @param {string} filePath the full path of csv file
 * @param {StreamReader} opt the options for stream
 * 
 * Read an file like an stream
 */
export async function streamReader(filePath: string, opt: StreamReader): Promise<void>{
    const fileStream = fs.createReadStream(filePath)
    const lineStream = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })
    return new Promise<void>((resolver, reject) => {
      let currentLineIndex = 0
      lineStream.addListener("line", (line) => {
        if(opt.onNextLine(line, currentLineIndex++)){
          lineStream.close()
          resolver()
          return
        }
      })
      fileStream.on("error", (err) => {
        return reject(new CSVNotFound(err, filePath))
      })

      lineStream.addListener("close", resolver)
    })
  
}