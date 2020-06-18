import path from "path"
import { CSVWriter } from "../../dist"

const fileName = path.resolve(__dirname, "output.csv")

interface Person {
  name: string
  age: number
}

const data: Person[] = [
  { name: 'David0', age: 18 },
  { name: 'David1', age: 18 },
  { name: 'David2', age: 18 },
  { name: 'David3', age: 18 },
  { name: 'David4', age: 18 }
]

async function loadCsv() {
  const writer = new CSVWriter<Person>(fileName, {
    headers: {
      name: 'name',
      age: 'age'
    }
  })
  await writer.write(data)
}

loadCsv()
  .then()
  .catch(console.error)