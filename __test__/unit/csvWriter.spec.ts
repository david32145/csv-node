import CSVWriter from '../../lib/CSVWriter'
import fs from 'fs'
import path from 'path'

interface Person {
  name: string,
  age: number,
  birthdate: Date
}

describe('Stream', () => {
  test('It should be write an object like csv file', async () => {
    const file = path.resolve(__dirname, '..', 'tmp', 'file5.csv')

    const writer = new CSVWriter(file, {
      headers: ['name', 'age']
    })
    const data = [
      { name: 'David0', age: '18' },
      { name: 'David1', age: '18' },
      { name: 'David2', age: '18' },
      { name: 'David3', age: '18' },
      { name: 'David4', age: '18' }
    ]

    await writer.write(data)

    const fileData = (await fs.promises.readFile(file)).toString('utf-8')

    expect(fileData)
      .toEqual('name,age\nDavid0,18\nDavid1,18\nDavid2,18\nDavid3,18\nDavid4,18\n')
  })

  test('It should be write an object with format values like csv file', async () => {
    const file = path.resolve(__dirname, '..', 'tmp', 'file5.csv')

    const writer = new CSVWriter<Person>(file, {
      headers: ['name', 'age', 'birthdate'],
      format: {
        birthdate: (birthdate) => birthdate.getMilliseconds().toString()
      }
    })
    const birthdate = new Date()
    const data: Person[] = [
      { name: 'David0', age: 18, birthdate },
      { name: 'David1', age: 18, birthdate },
      { name: 'David2', age: 18, birthdate },
      { name: 'David3', age: 18, birthdate },
      { name: 'David4', age: 18, birthdate }
    ]

    await writer.write(data)

    const fileData = (await fs.promises.readFile(file)).toString('utf-8')
    const timestamp = birthdate.getMilliseconds().toString()
    expect(fileData)
      .toEqual(`name,age,birthdate\nDavid0,18,${timestamp}\nDavid1,18,${timestamp}\nDavid2,18,${timestamp}\nDavid3,18,${timestamp}\nDavid4,18,${timestamp}\n`)
  })
})
