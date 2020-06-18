const path = require("path")
const { CSVWriter } = require("../../dist")

const fileName = path.resolve(__dirname, "output.csv")

const data = [
  { name: 'David0', age: 18 },
  { name: 'David1', age: 18 },
  { name: 'David2', age: 18 },
  { name: 'David3', age: 18 },
  { name: 'David4', age: 18 }
]

async function loadCsv() {
  const writer = new CSVWriter(fileName, {
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