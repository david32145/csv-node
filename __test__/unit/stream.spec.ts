import CSVStreamReader from '../../lib/stream'
import path from 'path'

describe('Stream', () => {
  test('It should be throw an error if file not found', async () => {
    const file = path.resolve(__dirname, '..', 'tmp', 'file_not_found.csv')

    await expect(CSVStreamReader.readAsync(file, {
      onNextLine: () => true
    })).rejects.toThrow('csv not found at:')
  })

  test('It should be call on error before throw exception', async () => {
    const file = path.resolve(__dirname, '..', 'tmp', 'file_not_found.csv')

    await expect(CSVStreamReader.readAsync(file, {
      onNextLine: () => true,
      onError: (err) => err
    })).rejects.toThrow('csv not found at:')
  })
})
