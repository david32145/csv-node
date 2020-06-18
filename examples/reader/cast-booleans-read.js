const path = require("path")
const { CSVReader } = require("../../dist")

const fileName = path.resolve(__dirname, "todos.csv")

async function loadCsv() {
  const reader = new CSVReader(fileName, {
    castBooleans: true
  })
  const data = await reader.read()
  console.log(data)
}

loadCsv()
  .then()
  .catch(console.error)