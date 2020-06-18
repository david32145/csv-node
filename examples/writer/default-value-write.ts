import path  from "path"
import { CSVWriter } from "../../dist"

const fileName = path.resolve(__dirname, "output.csv")

const data = [
  { name: 'David0' },
  { age: 18 },
  { name: 'David2', age: 18 },
  { name: 'David3'},
  { name: 'David4', age: 18 }
]

interface Person {
  name: string
  age: number
}

async function loadCsv() {
  const writer = new CSVWriter<Partial<Person>>(fileName, {
    headers: {
      name: 'name',
      age: 'age'
    },
    defaultValue: {
      name: 'None',
      age: '0'
    }
  })
  await writer.write(data)
}

loadCsv()
  .then()
  .catch(console.error)