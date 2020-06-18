import path  from "path"
import { CSVReader } from "../../dist"

const fileName = path.resolve(__dirname, "names.csv")

interface SimplePerson {
  name: string
  age: string
}

interface Person {
  name: string
  age: number
}

async function loadCsv() {
  const reader = new CSVReader<SimplePerson, Person>(fileName, {
    // data is of type SimplePerson
    map: (data) => ({
      name: data.name,
      age: Number(data.age)
    })
  })
  const data = await reader.read()
  console.log(data) // data is of type Person[]
}

loadCsv()
  .then()
  .catch(console.error)