import xlsx from 'xlsx'

export const parseWorkbook = (filepath: string) => {
  const workbook = xlsx.readFile(filepath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return xlsx.utils.sheet_to_json(sheet, { defval: '' }) as object[]
}

export const writeWorkbook = (data: any[], filepath: string) => {
  const workbook = xlsx.utils.book_new()
  const sheet = xlsx.utils.json_to_sheet(data)
  xlsx.utils.book_append_sheet(workbook, sheet)
  xlsx.writeFile(workbook, filepath)
}
