const path = require("path")
const { CSVReader } = require("../../dist")

const fileName = path.resolve(__dirname, "names.csv")

async function loadCsv() {
  const reader = new CSVReader(fileName, {
    castNumbers: true
  })
  const data = await reader.read()
  console.log(data)
}

loadCsv()
  .then()
  .catch(console.error)