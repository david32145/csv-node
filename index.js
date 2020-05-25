const Test = require('./dist')

const reader = new Test.default('csv.csv')

reader.read()
  .then((value) => {
    value[0]
  })
