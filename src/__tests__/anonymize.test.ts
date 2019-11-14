import { anonymize } from '../anonymize'
import faker from 'faker'
faker.seed(42)

it('should run the happy path', () => {
  const data = [
    { name: 'Trycia Hackett', salary: 1182, month: 0 },
    { name: 'Trycia Hackett', salary: 1046, month: 1 },
    { name: 'Trycia Hackett', salary: 1080, month: 2 },
    { name: 'Adrienne Wunsch', salary: 1162, month: 0 },
    { name: 'Adrienne Wunsch', salary: 1014, month: 1 },
    { name: 'Adrienne Wunsch', salary: 1030, month: 2 },
    { name: 'Joesph Towne', salary: 1128, month: 0 },
    { name: 'Joesph Towne', salary: 1116, month: 1 },
    { name: 'Joesph Towne', salary: 1134, month: 2 },
  ]
  const { data: anonymousData } = anonymize(data, [
    { column: 'name', anonymizer: faker.name.findName, memo: true },
    { column: 'salary', anonymizer: () => faker.random.number({ min: 800, max: 1200 }) },
  ])
  expect(anonymousData[0].month).toBe(data[0].month)
  expect(anonymousData[0].salary).not.toBe(data[0].salary)
  expect(anonymousData[0].name).not.toBe(data[0].name)
  expect(anonymousData[0].name).toBe(anonymousData[1].name)
})

it('should not create data for empty fields', () => {
  const data = [
    { name: 'Trycia Hackett', salary: 1182, month: 0 },
    { salary: 1046, month: 1 },
  ]
  const { data: anonymousData } = anonymize(data, [
    { column: 'name', anonymizer: faker.name.findName },
  ])
  expect(anonymousData[0].name).not.toBe(data[0].name)
  expect(anonymousData[1].name).toBe(data[1].name)
})
