import path from "path"
import CSVReadUtil from "~/lib/utils"

const csvFileTest = path.resolve(__dirname, "..", "tmp", "file.csv")

describe("Util", () => {
  test("It should be return the absolute path of an file", () => {
    const file = "./__test__/tmp/file.csv"
    const fileWithAbsolutePath = path.resolve(__dirname, "..", "tmp", "file.csv")

    expect(CSVReadUtil.getAbsolutePath(fileWithAbsolutePath)).toBe(csvFileTest)
    expect(CSVReadUtil.getAbsolutePath(file)).toBe(csvFileTest)
  })

  test("It should be return an array with csv header columns", () => {
    const strHeader = "cod,name,age,date"
    const headers = CSVReadUtil.splitHeader(strHeader)
    expect(headers).toStrictEqual(["cod", "name", "age", "date"])
  })

  test("It should be throw an error if header is null ou empty", () => {
    const strHeader = ""
    expect(() => {
      CSVReadUtil.splitHeader(strHeader)
    }).toThrowError("Header cannot be null or empty")
  })
})