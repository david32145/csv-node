import path  from "path"
import { CSVReader } from "../../dist"

const fileName = path.resolve(__dirname, "todos.csv")

interface SimplePerson {
  name: string
  completed: boolean
}

async function loadCsv() {
  const reader = new CSVReader<SimplePerson>(fileName, {
    castBooleans: true
  })
  const data = await reader.read()
  console.log(data) // data is of type SimplePerson[]
}

loadCsv()
  .then()
  .catch(console.error)