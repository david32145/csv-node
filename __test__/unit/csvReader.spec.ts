import path from "path"
import { createReadCSVFile } from "~/lib/readCSV"

const csvFileTest = path.resolve(__dirname, "..", "tmp", "file.csv")
const csvFileTest2 = path.resolve(__dirname, "..", "tmp", "file2.csv")

interface Person {
  id: number
  name: string
  age: number
  birthdate: string
}

describe("CSVReader basic", () => {
  test("it should be return the csv content like javascript object", async () => {
    const readCSVFile = createReadCSVFile<Person>(csvFileTest)
    const result = await readCSVFile.read();
    expect(result.data).toEqual(expect.arrayContaining([
      {
        id: "0",
        name: 'David',
        age: '19',
        birthdate: '17-08-2000'
      }
    ]))
    expect(result.headers).toStrictEqual(["id", "name", "age", "birthdate"])
  })

  test("It should be rename colunms with alias", async () => {
    const readCSVFile = createReadCSVFile<Person>(csvFileTest2, {
      alias: {
        id: "Número",
        name: "Nome",
        age: "Idade",
        birthdate: "Data de Nascimento"
      }
    })
    const result = await readCSVFile.read();
    expect(result.headers).toStrictEqual(["Número", "Nome", "Idade", "Data de Nascimento"])
    expect(result.nativeHeaders).toStrictEqual(["id", "name", "age", "birthdate"])
  })

  test("It should be rename colunm name only", async () => {
    const readCSVFile = createReadCSVFile<Person>(csvFileTest2, {
      alias: {
        name: "Nome",
      }
    })
    const result = await readCSVFile.read();
    expect(result.headers).toStrictEqual(["id", "Nome", "age", "birthdate"])
    expect(result.nativeHeaders).toStrictEqual(["id", "name", "age", "birthdate"])
  })

  test("It should be skip 2 lines", async () => {
    const readCSVFile = createReadCSVFile<Person>(csvFileTest2, {
      skipLines: 3
    })
    const result = await readCSVFile.read();
    expect(result.data.length).toBe(3)
  })

  test("It should be limit the result in 2 results", async () => {
    const readCSVFile = createReadCSVFile<Person>(csvFileTest2, {
      skipLines: 1,
      limit: 3
    })
    const result = await readCSVFile.read();
    expect(result.data.length).toBe(3)
  })
})