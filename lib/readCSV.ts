import {streamReader} from "./stream"

import {parserHeader, parseLine, getAbsolutePath} from "./utils"

export interface CreateReadCSVOptions {
  alias?: {[property: string]: string}
  skipLines?: number
  limit?: number
}

export function createReadCSVFile<T>(filePath: string, options?: CreateReadCSVOptions){
  return {
    read: () => readCSVFile<T>(filePath, options)
  }
}

export interface CSVResult<T> {
  data: T[]
  headers: string[]
  nativeHeaders: string[]
}

function isSkipLines(currentLine: number, options?: CreateReadCSVOptions): boolean {
  if(options?.skipLines && currentLine <= options.skipLines){
    return true
  }
  return false
}

function limitExceeded(currentLine: number, options?: CreateReadCSVOptions){
  const skipLinesNumbers = options?.skipLines || 0
  if(!options?.limit){
    return false
  }
  const linesRead = currentLine - skipLinesNumbers - 1
  if(linesRead >= options.limit){
    return true
  }

  return false
}

async function readCSVFile<T>(filePath: string, options?: CreateReadCSVOptions) {
  const absoluteFilePath = getAbsolutePath(filePath)
  const obj: CSVResult<T> = {
    data: [],
    headers: [],
    nativeHeaders: []
  }
  await streamReader(absoluteFilePath, {
    onNextLine: (line, index) => {
      if(index === 0){
        obj.nativeHeaders = parserHeader(line)
      } else {
        if(isSkipLines(index, options)){
          return false
        }
        if(limitExceeded(index, options)) {
          return true
        }
        obj.data.push(parseLine<T>(line, obj.nativeHeaders, {
          mapAlias: options?.alias
        }))
      }
      return false
    }
  })
  obj.headers = obj.nativeHeaders.map(header => {
    if(options && options.alias) {
      if(options.alias[header]){
        return options.alias[header]
      }
    }
    return header
  })
  return obj
}
