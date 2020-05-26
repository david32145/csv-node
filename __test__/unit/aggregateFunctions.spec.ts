import path from 'path'
import CSVReader from '../../lib/readCSV'

const csvFileTest = path.resolve(__dirname, '..', 'tmp', 'file3.csv')

describe('Aggregate Functions', () => {
  test('It should be return min of an column', async () => {
    const reader = new CSVReader(csvFileTest)
    const min = await reader.min('price')
    expect(min).toBe(0.03)
  })

  test('It should be return max of an column', async () => {
    const reader = new CSVReader(csvFileTest)
    const max = await reader.max('price')
    expect(max).toBe(99.99)
  })

  test('It should be return sum of an column', async () => {
    const reader = new CSVReader(csvFileTest)
    const sum = await reader.sum('price')
    expect((sum || 0).toFixed(2)).toBe('49492.77')
  })

  test('It should be return sum of an column and skip 10 lines and in max 10 lines', async () => {
    const reader = new CSVReader(csvFileTest, {
      skipLines: 10,
      limit: 10
    })
    const sum = await reader.sum('price')
    expect((sum || 0).toFixed(2)).toBe('326.63')
  })

  test('It should be return avg like undefined', async () => {
    const reader = new CSVReader(csvFileTest, {
      skipLines: 1000
    })
    const sum = await reader.avg('price')
    expect(sum).toBeUndefined()
  })

  test('It should be return avg of an column', async () => {
    const reader = new CSVReader(csvFileTest)
    const avg = await reader.avg('price')
    expect((avg || 0).toFixed(5)).toBe('49.49277')
  })

  test('It should be return avg of an column of first 12 rows', async () => {
    const reader = new CSVReader(csvFileTest, {
      limit: 12
    })
    const avg = await reader.avg('price')
    expect((avg || 0).toFixed(2)).toBe('60.35')
  })
})
