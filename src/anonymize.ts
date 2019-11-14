export type AnonymizerConfig<T> = {
  column: keyof T
  anonymizer: () => T[keyof T]
  memo?: boolean
}

export const anonymize = <T>(rows: T[], configs: AnonymizerConfig<T>[]) => {
  const memoDict = {} as any
  return {
    data: configs.reduce((acc, { anonymizer, column, memo }) => {
      return acc.map(row => {
        let value
        const existingValue = row[column]
        if (existingValue === undefined) return row
        if (memo) {
          if (memoDict[existingValue] === undefined) {
            memoDict[existingValue] = anonymizer()
          }
          value = memoDict[existingValue]
        } else {
          value = anonymizer()
        }
        return { ...row, [column]: value }
      })
    }, rows),
    memoDict,
  }
}
