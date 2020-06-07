# CSV Node

<p align="center">
  <img src="./assets/Logo.png" width="250" alt="CSV Node" />
</p>

<h3 align="center"> 
  An awesome library for manager csv files  with <code>javascript/typescript</code>
</h3>

<div align="center">
  <a href="https://github.com/david32145/csv-node/action">
    <img src="https://github.com/david32145/csv-node/workflows/build/badge.svg" />
  </a>
  <a href="https://npm-stat.com/charts.html?package=csv-node">
    <img src="https://img.shields.io/npm/dm/csv-node.svg" />
  </a>
  <a href="http://standardjs.com/">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg">
  </a>
   <a href="https://www.npmjs.com/package/csv-node">
    <img src="https://badge.fury.io/js/csv-node.svg">
  </a>
  <a href="https://coveralls.io/github/david32145/csv-node?branch=master">
    <img src="https://coveralls.io/repos/github/david32145/csv-node/badge.svg?branch=master">
  </a>
</div>

## Overview

The library is for read csv and manager csv tables like humam, automating the process of read
and serializer the csv rows to obeject.

## Sumary

- [Features](#features)
- [Next Feature](#next-features)
- [Install](#install)
- [Usage](#usage)
  - [Basic Usage](#basic-usage)
    - [First Read](#first-read)
  - [Options](#options)
  - [Options Usage](#options-usage)
    - [Alias](#alias)
    - [Skip Lines](#skip-lines)
    - [Limit](#limit)
    - [Delimiter](#delimiter)
    - [Filter](#filter)
    - [Map](#map)
- [The filePath](#the-filePath)
- [CSVReader API](#cSVReader-API)
  - [Fields](#fields)
  - [Methods](#methods)
    - [Read](#read)
    - [Min](#min)
    - [Max](#max)
    - [Avg](#avg)
    - [Sum](#sum)
- [Typescript Support](#typescript-support)

## Features

- Read an csv file and serializer data to `javascript/typescript` objects;
- Alias in colunms of csv table;
- Skip row of csv;
- Limit numbers of rows.
- Map row;
- Agregates function (max, min, avg and sum) in an colunm;
- Filter rows.

## Next Features

- Improve Typescript docs;
- Automatic and manual casting types;
- Join csv tables;
- Write csv tables;

## Install

```bash
npm install csv-node
```

or

```bash
yarn add csv-node
```

## Usage

First import class _CSVReader_ of module _csv-node_.

```ts
import { CSVReader } from "csv-node"
// or
const { CSVReader } = require("csv-node")
```

The module _csv-node_ export:

|name|description|
|:-----|:-----|
|AliasMap|An object for mapper alias columns names|
|CSVNotFound|Error, throw if file not exist|
|CSVReader|The classe of manager csv files|
|ReadCSVOptions|The options for read an csv|
|FilterFunction|An function for filter rows in csv files|

The module esport also *NextStrategy*, *PipelineFunction*, *PredicateFunction*. Related to details of implementation.

### Basic usage

```js
// names.csv
name,age
Joh,19
Mary,20
Nicoll,21
Ju,18
```
Let, create an file _index.js_, for example, and function _loadCsv_, for example, for your tests.

```js
const { CSVReader } = require("csv-node")

async function loadCsv() {
  // let's go...
}

loadCsv()
  .then()
  .catch(console.error)
```

Run `node index.js` in your bash for tests.

#### First read

Use `path` for absolutes paths in NodeJS.

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader(fileName)
  const data = await reader.read()
  console.log(data)
}
```

Output.
```json
[
  { "name": "Joh", "age": "19" },
  { "name": "Mary", "age": "20" },
  { "name": "Nicoll", "age": "21" },
  { "name": "Ju", "age": "18" }
]
```
Even though age is an number, but is loaded like an string, your can be use an map function
of _CSVReader_ for fix this.


### Options

The second param of contructor `CSVReader` is an object of options, the options availables are.

|name|description|type|required|default|
|:-----|:-----|:---:|:-----|:-----|
|alias|An object that will rename columns|`object`|false|`{}`|
|skipLines|The numbers of lines for skipping|`number`|false|`0`|
|limit|The numbers max of rows|`number`|false|`Infinity`|
|delimiter|Delimiter between columns|`string`|false|`,`|
|filter|Filter rows likes `Array.filter`|`FilterFunction`|false|`none`|
|map|Map rows likes `Array.map`|`MapFunction`|false|`none`|

### Options usage

#### Alias

You doesn't need rename all headers of csv table.
```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader(fileName, {
    alias: {
      name: 'Name',
      age: 'Age'
    }
  })
  const data = await reader.read()
  console.log(data)
}
```

Output.
```json
[
  { "Name": "Joh", "Age": "19" },
  { "Name": "Mary", "Age": "20" },
  { "Name": "Nicoll", "Age": "21" },
  { "Name": "Ju", "Age": "18" }
]
```

#### Skip Lines

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader(fileName, {
    skipLines: 1
  })
  const data = await reader.read()
  console.log(data)
}
```

Output.
```json
[
  { "name": "Mary", "age": "20" },
  { "name": "Nicoll", "age": "21" },
  { "name": "Ju", "age": "18" }
]
```

#### Limit

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader(fileName, {
    limit: 2
  })
  const data = await reader.read()
  console.log(data)
}
```

Output.
```json
[
  { "Name": "Joh", "Age": "19" },
  { "Name": "Mary", "Age": "20" }
]
```

#### Delimiter

This is delimiter between colunms.

#### Filter

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader(fileName, {
    filter: (data) => data.age < 20
  })
  const data = await reader.read()
  console.log(data)
}
```

Output.
```json
[
  { "Name": "Joh", "Age": "19" },
  { "Name": "Ju", "Age": "18" }
]
```

#### Map

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader(fileName, {
    map: (data) => `${data.name}-${data.age}`
  })
  const data = await reader.read()
  console.log(data)
}
```

Output.
```json
[ "Joh-19", "Mary-20", "Nicoll-21", "Ju-18" ]
```

The options can be combined.

Order of call of options:

1. Alias
3. Map
3. Skip Lines & Limit
4. Filter

## The filePath

`filePath` must be absolute or `csv-node` search the file startirg of root folder of project node.

## CSVReader API

The `CSVReader` class provide the methods and fields bellow.

### Fields

|name|description|type|
|:-----|:-----|:---:|
|headers|The headers columns with alias|`string []`|
|nativeHeaders|The real headers of csv table|`string []`|
|data|The data of csv|`T[]`|

All fields only is available before call function `read`.

### Methods

|name|description|return|
|:-----|:-----|:---:|
|`read()`|Read the csv data|`Promise<T[]>`|
|`min(column: string)`|Return the min value of an column|`Promise<number | undefined>`|
|`sum(column: string)`|Return the sum value of an column|`Promise<number | undefined>`|
|`max(column: string)`|Return the max value of an column|`Promise<number | undefined>`|
|`avg(column: string)`|Return the average value of an column|`Promise<number | undefined>`|

For tests, you can be usage the file [CSV Test](./__test__/tmp/file3.csv).

#### Read

The `read` function already explained in [Usage](#usage).

#### Min

The min function return the min value of column passed in parameters of `min(string: column)`.
You can be usage the option config like `read()` function.

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "file3.csv")
  const reader = new CSVReader(fileName)

  const min = await reader.min("price")
  console.log(min)
}
// 0.03
```

#### Max

The max function return the max value of column passed in parameters of `max(string: column)`.
You can be usage the option config like `read()` function.

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "file3.csv")
  const reader = new CSVReader(fileName)

  const max = await reader.max("price")
  console.log(max)
}
// 99.99
```

#### Avg

The avg functions return the average value of column passed in parameters of `avg(string: column)`.
You can be usage the option config like `read()` function.

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "file3.csv")
  const reader = new CSVReader(fileName)

  const avg = await reader.avg("price")
  console.log(max)
}
// 49.492769999999936
```

#### Sum

The avg functions return the sum value of column passed in parameters of `sum(string: column)`.
You can be usage the option config like `read()` function.

```js
async function loadCsv() {
  const fileName = path.resolve(__dirname, "file3.csv")
  const reader = new CSVReader(fileName)

  const sum = await reader.sum("price")
  console.log(sum)
}
// 49492.76999999994
```

## CSVWriter API

### Fields

|name|description|type|
|:-----|:-----|:---:|
|headers|The headers of columns|`string []`|
|delimiter|The delimiter between colunms|`string`|

The first parameter of CSVWriter is the destination file, the second is an object, que contains the headers columns of the csv file and `delimiter`.

### Methods

|name|description|return|
|:-----|:-----|:---:|
|`writer(data: object)`|Write the object in csv|`Promise<void>`|


```js
async function writeCsv() {
  const writer = new CSVWriter(file, {
    headers: ['name', 'age']
  })
  const data = [
    { name: 'David0', age: '18' },
    { name: 'David1', age: '18' },
    { name: 'David2', age: '18' },
    { name: 'David3', age: '18' },
    { name: 'David4', age: '18' }
  ]

  await writer.write(data)
}
// write an like
```

```csv
name,age
David0,18
David1,18
David2,18
David3,18
David4,18
```

## Typescript Support

The library provider typescript support.

```ts
interface Person {
  name: string
  age: string
}

async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader<Person>(fileName)
  const data = await reader.read() // data is Person[]
  console.log(data)
}
```

Output.
```json
[
  { "Name": "Joh", "Age": "19" },
  { "Name": "Mary", "Age": "20" },
  { "Name": "Nicoll", "Age": "21" },
  { "Name": "Ju", "Age": "18" }
]
```

#### With map

```ts
interface Person {
  name: string
  age: string
}

interface PersonMap {
  fullName: string
  age: number
}

async function loadCsv() {
  const fileName = path.resolve(__dirname, "names.csv")
  const reader = new CSVReader<Person, PersonMap>(fileName, {
    // data is Person
    map: (data) => ({
      fullName: data.name,
      age: Number(data.age)
    })
  })
  const data = await reader.read() // data is PersonMap[]
  console.log(data)
}
```

Output.
```json
[
  { "fullName": "Joh", "age": 19 },
  { "fullName": "Mary", "age": 20 },
  { "fullName": "Nicoll", "age": 20 },
  { "fullName": "Ju", "age": 18 }
]
```