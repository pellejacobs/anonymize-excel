import path from 'path'
import { parseWorkbook, writeWorkbook } from '../xlsx'
import { anonymize } from '../anonymize'

it('should parseworkbook properly', () => {
  const data = parseWorkbook(path.join(__dirname, './salary-data.xlsx'))
  const anonymousData = anonymize(data, [])
  writeWorkbook(anonymousData.data, path.join(__dirname, './salary-data-anonymous.xlsx'))
})
