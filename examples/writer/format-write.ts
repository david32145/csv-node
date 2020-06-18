import path from "path"
import { CSVWriter } from "../../dist"

const fileName = path.resolve(__dirname, "output.csv")

const data: Person[] = [
  { name: 'David0', age: 18 },
  { name: 'David1', age: 18 },
  { name: 'David2', age: 18 },
  { name: 'David3', age: 18 },
  { name: 'David4', age: 18 }
]

interface Person {
  name: string
  age: number
}

async function loadCsv() {
  const writer = new CSVWriter<Person>(fileName, {
    headers: {
      name: 'name',
      age: 'age'
    },
    format: {
      age: (age) => `${age} years`
    }
  })
  await writer.write(data)
}

loadCsv()
  .then()
  .catch(console.error)