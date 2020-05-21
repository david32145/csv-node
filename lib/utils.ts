import path from "path"

export function parserHeader(headerLine: string): string[] {
  if(!headerLine || !headerLine.trim().length){
    throw new Error("Header cannot be null or empty")
  }
  return headerLine.split(",")
}

interface ParseLineOptions {
  mapAlias?: {[property: string]: string}
}

function getIndexName(header: string[], index: number, options?: ParseLineOptions) {
  let indexName = header[index]
  if(options && options.mapAlias){
    const map = options.mapAlias
    if(!!map[indexName]){
      indexName = map[indexName]
    }
  }
  return indexName
}

export function parseLine<T>(line: string, header: string[], options?: ParseLineOptions): T {
  return line.split(",")
    .reduce<any>((acc, item, index) => {
      const indexName = getIndexName(header, index, options)
      acc[indexName] = item
      return acc
    }, {}) as T
}

/**
 * 
 * @param filePath the filePath of csv
 * 
 * if filePath not is absolute, will search the file
 * starting the root folder.
 */
export function getAbsolutePath(filePath: string): string {
  if (!path.isAbsolute(filePath)){
    return path.resolve(process.cwd(), filePath)
  }
  return filePath
}