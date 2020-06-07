import CSVWriter from '../../lib/writerCSV'
import fs from 'fs'
import path from 'path'

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
})
