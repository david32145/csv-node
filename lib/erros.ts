export class CSVNotFound extends Error {
  constructor(throwable: Error, filePath: string) {
    super("CSVNotFound")
    super.message = "csv not found at: " + filePath
    super.stack = throwable.stack
  }
}