import path  from "path"
import { CSVReader } from "../../dist"

const fileName = path.resolve(__dirname, "names.csv")

interface SimplePerson {
  name: string
  age: number
}

async function loadCsv() {
  const reader = new CSVReader<SimplePerson>(fileName, {
    castNumbers: true
  })
  const data = await reader.read()
  console.log(data) // data is of type SimplePerson[]
}

loadCsv()
  .then()
  .catch(console.error)