import path  from "path"
import { CSVReader } from "../../dist"

const fileName = path.resolve(__dirname, "names.csv")

interface SimplePerson {
  Name: string
  Age: string
}

async function loadCsv() {
  const reader = new CSVReader<SimplePerson>(fileName, {
    alias: {
      name: 'Name',
      age: 'Age'
    }
  })
  const data = await reader.read()
  console.log(data) // data is of type SimplePerson[]
}

loadCsv()
  .then()
  .catch(console.error)