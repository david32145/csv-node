import path from 'path'
import CSVReader from '../../lib/CSVReader'

const csvFileTest = path.resolve(__dirname, '..', 'tmp', 'file.csv')
const csvFileTest2 = path.resolve(__dirname, '..', 'tmp', 'file2.csv')
const csvFileTest4 = path.resolve(__dirname, '..', 'tmp', 'file4.csv')

interface Person {
  id: number
  name: string
  age: number
  birthdate: string
}

interface GenrePerson {
  id: number
  name: string
  female: boolean
}

describe('CSVReader basic', () => {
  test('it should be return the csv content like javascript object', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest)
    const data = await csvReader.read()
    expect(data).toEqual(expect.arrayContaining([
      {
        id: '0',
        name: 'David',
        age: '19',
        birthdate: '17-08-2000'
      }
    ]))
    expect(csvReader.headers).toStrictEqual(['id', 'name', 'age', 'birthdate'])
  })

  test('It should be throw an error if file not found', async () => {
    const file = path.resolve(__dirname, '..', 'tmp', 'file_not_found.csv')
    const csvReader = new CSVReader<Person>(file)
    await expect(csvReader.read()).rejects.toThrow('csv not found at:')
  })

  test('It should be rename colunms with alias', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      alias: {
        id: 'Número',
        name: 'Nome',
        age: 'Idade',
        birthdate: 'Data de Nascimento'
      }
    })
    await csvReader.read()
    expect(csvReader.headers).toStrictEqual(['Número', 'Nome', 'Idade', 'Data de Nascimento'])
    expect(csvReader.nativeHeaders).toStrictEqual(['id', 'name', 'age', 'birthdate'])
  })

  test('It should be map rows as string', async () => {
    const csvReader = new CSVReader<Person, string>(csvFileTest2, {
      map: (data) => {
        return `${data.id}-${data.name}`
      }
    })
    await csvReader.read()
    expect(csvReader.data).toEqual(expect.arrayContaining([
      '0-David0',
      '1-David1',
      '2-David2',
      '3-David3',
      '4-David4',
      '5-David5'
    ]))
  })

  test('It should be cast numbers', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      limit: 1,
      castNumbers: true
    })
    await csvReader.read()
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 0,
        name: 'David0',
        age: 19,
        birthdate: '17-08-2000'
      })
    ]))
  })

  test('It should be cast booleans and numbers', async () => {
    const csvReader = new CSVReader<GenrePerson>(csvFileTest4, {
      limit: 2,
      castNumbers: true,
      castBooleans: true
    })
    await csvReader.read()
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 0,
        name: 'David0',
        female: true
      }),

      expect.objectContaining({
        id: 1,
        name: 'David1',
        female: false
      })
    ]))
  })

  test('It should be map rows as string and skip one line', async () => {
    const csvReader = new CSVReader<Person, string>(csvFileTest2, {
      map: (data) => {
        return `${data.id}-${data.name}`
      },
      skipLines: 1
    })
    await csvReader.read()
    expect(csvReader.data).toEqual(expect.arrayContaining([
      '1-David1',
      '2-David2',
      '3-David3',
      '4-David4',
      '5-David5'
    ]))
  })

  test('It should be map rows as string and skip two line and limit at to 3 result', async () => {
    const csvReader = new CSVReader<Person, string>(csvFileTest2, {
      map: (data) => {
        return `${data.id}-${data.name}`
      },
      skipLines: 2,
      limit: 3
    })
    await csvReader.read()
    expect(csvReader.data).toEqual(expect.arrayContaining([
      '2-David2',
      '3-David3',
      '4-David4'
    ]))
  })

  test('It should be map rows as string and skip two line and limit at to 3 result with alias', async () => {
    type PersonT = Omit<Person, 'name'> & {Name: string}
    const csvReader = new CSVReader<PersonT, string>(csvFileTest2, {
      map: (data) => {
        return `${data.id}-${data.Name}`
      },
      alias: {
        name: 'Name'
      },
      skipLines: 2,
      limit: 3
    })
    await csvReader.read()
    expect(csvReader.data).toEqual(expect.arrayContaining([
      '2-David2',
      '3-David3',
      '4-David4'
    ]))
  })

  test('It should be rename colunm name only', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      alias: {
        name: 'Name'
      }
    })
    await csvReader.read()
    expect(csvReader.headers).toStrictEqual(['id', 'Name', 'age', 'birthdate'])
    expect(csvReader.nativeHeaders).toStrictEqual(['id', 'name', 'age', 'birthdate'])
  })

  test('It should be rename colunm age only', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      alias: {
        age: 'Age'
      }
    })
    await csvReader.read()
    expect(csvReader.headers).toStrictEqual(['id', 'name', 'Age', 'birthdate'])
    expect(csvReader.nativeHeaders).toStrictEqual(['id', 'name', 'age', 'birthdate'])
  })

  test('It should be skip 3 lines', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      skipLines: 3
    })
    const result = await csvReader.read()
    expect(result.length).toBe(3)
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: '3',
          name: 'David3',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '4',
          name: 'David4',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '5',
          name: 'David5',
          age: '19',
          birthdate: '17-08-2000'
        }
      )
    ]))
  })

  test('It should be skip 1 lines', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      skipLines: 1
    })
    const result = await csvReader.read()
    expect(result.length).toBe(5)
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: '1',
          name: 'David1',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '2',
          name: 'David2',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '3',
          name: 'David3',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '4',
          name: 'David4',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '5',
          name: 'David5',
          age: '19',
          birthdate: '17-08-2000'
        }
      )
    ]))
  })

  test('It should be skip 4 lines', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      skipLines: 4
    })
    const result = await csvReader.read()
    expect(result.length).toBe(2)
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: '4',
          name: 'David4',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '5',
          name: 'David5',
          age: '19',
          birthdate: '17-08-2000'
        }
      )
    ]))
  })

  test('It should be skip 6 lines', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      skipLines: 6
    })
    const result = await csvReader.read()
    expect(result.length).toBe(0)
    expect(csvReader.data).toEqual(expect.arrayContaining([]))
  })

  test('It should be limit the result in 3 results', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      skipLines: 1,
      limit: 3
    })
    const result = await csvReader.read()
    expect(result.length).toBe(3)
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: '1',
          name: 'David1',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '2',
          name: 'David2',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '3',
          name: 'David3',
          age: '19',
          birthdate: '17-08-2000'
        }
      )
    ]))
  })

  test('It should be limit the result in 1 results', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      limit: 1
    })
    const result = await csvReader.read()
    expect(result.length).toBe(1)
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: '0',
          name: 'David0',
          age: '19',
          birthdate: '17-08-2000'
        }
      )]))
  })

  test('It should be limit the result in 10 results', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      limit: 10
    })
    const result = await csvReader.read()
    expect(result.length).toBe(6) // max lines is 6
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: '0',
          name: 'David0',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '1',
          name: 'David1',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '2',
          name: 'David2',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '3',
          name: 'David3',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '4',
          name: 'David4',
          age: '19',
          birthdate: '17-08-2000'
        }
      ),
      expect.objectContaining(
        {
          id: '5',
          name: 'David5',
          age: '19',
          birthdate: '17-08-2000'
        }
      )
    ]))
  })

  test('It should be filter all persons with cod < 5', async () => {
    const csvReader = new CSVReader<Person>(csvFileTest2, {
      filter: (data) => data.id >= 5
    })
    const result = await csvReader.read()
    expect(result.length).toBe(1) // max lines is 6
    expect(csvReader.data).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: '5',
          name: 'David5',
          age: '19',
          birthdate: '17-08-2000'
        }
      )
    ]))
  })
})
