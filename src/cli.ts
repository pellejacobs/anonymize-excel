import faker from 'faker'
import fuzzy from 'fuzzy'
import chalk from 'chalk'
import fs from 'fs'
import inquirer from 'inquirer'
import { anonymize, AnonymizerConfig } from './anonymize'
import { parseWorkbook, writeWorkbook } from './xlsx'
inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'))
inquirer.registerPrompt('list-plus', require('inquirer-autocomplete-prompt'))

if (!process.argv[2]) {
  console.log('Add the filepath to the excel file as a second argument')
  process.exit(1)
}
const filepath = process.argv[2]
if (!fs.existsSync(filepath)) {
  console.log(`${filepath} does not exist.`)
  process.exit(1)
}

type AnonymizerOption = {
  name: string
  fn: (opts) => string | number
  args?: inquirer.QuestionCollection
}

const anonymizerOptions: AnonymizerOption[] = [
  { name: 'Person', fn: () => `${faker.name.firstName()} ${faker.name.lastName()}` },
  { name: 'Jobtitle', fn: () => faker.name.title() },
  {
    name: 'Amount',
    args: [{ type: 'number', name: 'max' }, { type: 'number', name: 'min' }],
    fn: ({ min, max }) => Math.round(min * 100 + Math.random() * (max - min) * 100) / 100,
  },
  { name: 'Department', fn: () => faker.commerce.department() },
  { name: 'Abbreviation', fn: () => faker.random.alphaNumeric(3).toUpperCase() },
]

const getAnonymizer = async (column): Promise<AnonymizerConfig<any>> => {
  const { name } = await inquirer.prompt({
    type: 'list-plus' as 'list',
    name: 'name',
    message: `Which anonymizer to use for ${chalk.green(column)}`,
    ...{
      source: async (_, input) =>
        fuzzy.filter(input || '', anonymizerOptions.map(a => a.name)).map(c => c.original),
    },
  })
  let args = {}
  const option = anonymizerOptions.find(option => option.name === name)
  if (option.args) {
    args = await inquirer.prompt(option.args)
  }
  const { memo } = await inquirer.prompt({
    type: 'confirm',
    name: 'memo',
    message: 'Enforce consistency',
  })
  return { column, anonymizer: () => option.fn(args), memo }
}

const main = async () => {
  const data = parseWorkbook(filepath)
  const columns = data.reduce<Set<any>>((acc, row) => {
    for (const [key, value] of Object.entries(row)) {
      if (!!value) acc.add(key)
    }
    return acc
  }, new Set())
  const result = await inquirer.prompt({
    type: 'checkbox-plus' as 'checkbox',
    name: 'columns',
    message: 'Select columns to anonymize',
    ...{
      searchable: true,
      source: async (_, input) => fuzzy.filter(input || '', [...columns]).map(c => c.original),
    },
  })
  const anonymizers = []
  for (const column of result.columns) {
    anonymizers.push(await getAnonymizer(column))
  }

  const anonymousData = anonymize(data, anonymizers)
  const { outputpath } = await inquirer.prompt({
    type: 'input',
    name: 'outputpath',
    message: 'Filename of the output file',
    default: filepath.replace(/\.xlsx$/, '-anonymous.xlsx'),
    validate: input => !!input,
  })
  writeWorkbook(anonymousData.data, outputpath)
}

main()
