const isEmpty = (value: string | undefined): boolean =>
  value === undefined || value.trim() === '' || value.trim().toLowerCase() === 'nan'

export const str = (value: string | undefined, fallback = ''): string =>
  isEmpty(value) ? fallback : (value as string).trim()

export const nullableStr = (value: string | undefined): string | null =>
  isEmpty(value) ? null : (value as string).trim()

export const toInt = (value: string | undefined): number => {
  if (isEmpty(value)) return 0

  const parsed = Number.parseInt((value as string).trim(), 10)

  return Number.isFinite(parsed) ? parsed : 0
}

export const toFloat = (value: string | undefined): number | null => {
  if (isEmpty(value)) return null

  const parsed = Number.parseFloat((value as string).trim().replace(',', '.'))

  return Number.isFinite(parsed) ? parsed : null
}

export const toBool = (value: string | undefined): boolean => {
  if (isEmpty(value)) return false

  const normalized = (value as string).trim().toLowerCase()

  return normalized === '1' || normalized === 'sim' || normalized === 's' || normalized === 'true'
}

export const toDate = (value: string | undefined): string | null => {
  if (isEmpty(value)) return null

  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  }

  const match = (value as string).trim().toLowerCase().match(/^(\d{2})([a-z]{3})(\d{2,4})/)
  if (!match) return null

  const day = match[1]
  const monthName = match[2]
  const yearRaw = match[3]
  if (day === undefined || monthName === undefined || yearRaw === undefined) return null

  const month = months[monthName]
  if (month === undefined) return null

  const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw

  return `${year}-${month}-${day}`
}
