import path from 'path'
import { AliasMap } from './models'

class CSVUtil {
  /**
  *
  * @param {string} filePath the filePath of csv
  *
  * if filePath not is absolute, will search the file
  * starting of the root folder/project.
  *
  * @returns {string} the absolute path of filePath
  */
  public getAbsolutePath (filePath: string): string {
    if (!path.isAbsolute(filePath)) {
      return path.resolve(process.cwd(), filePath)
    }
    return filePath
  }

  /**
   *
   * @param {string} header the header line of csv
   * @param {string} delimiter the delimiter between columns
   *
   * split the header row in an array of columns
   *
   * @returns {string[]} array of columns
   */
  public splitHeader (header: string, delimiter = ','): string[] {
    if (!header || !header.trim().length) {
      throw new TypeError('Header cannot be null or empty')
    }
    return header.split(delimiter)
  }

  /**
   *
   * @param {string} nativeHeaders the originais headers
   * @param {AliasMap} alias the map for rename headers
   *
   * Rename headers with the map pass in `alias`
   */
  public mapNativeHeaderToHeader (nativeHeaders: string[], alias?: AliasMap): string [] {
    const aliasMap = alias || {}
    return nativeHeaders.map(nativeHeader => {
      if (aliasMap[nativeHeader]) {
        return aliasMap[nativeHeader]
      }
      return nativeHeader
    })
  }

  public mapRowToSimpleObject<T> (row: string, headers: string[], delimiter = ',', castNumbers = false, castBooleans = false): T {
    const splitRows = row.split(delimiter)
    return splitRows.reduce((acc, rowItem, index) => {
      let value: any = rowItem
      if (castNumbers && !isNaN(Number(rowItem))) {
        value = Number(value)
      }
      if (castBooleans && (value === 'true' || value === 'false')) {
        value = value === 'true'
      }
      acc[headers[index]] = value
      return acc
    }, {} as any) as T
  }
}

export default new CSVUtil()
