import { format, parseISO } from 'date-fns'

/**
 * Money is stored strictly as INTEGER paisa (1 Rupee = 100 paisa).
 * Formats paisa as "Rs 1,234.50" with thousand separators.
 */
export function formatMoney(paisa: number | null | undefined): string {
  if (paisa === null || paisa === undefined || isNaN(paisa)) {
    return 'Rs 0.00'
  }

  const isNegative = paisa < 0
  const absPaisa = Math.abs(Math.round(paisa))
  const rupees = Math.floor(absPaisa / 100)
  const remainderPaisa = absPaisa % 100

  // Format rupees with comma separators
  const formattedRupees = rupees.toLocaleString('en-PK', {
    maximumFractionDigits: 0
  })

  const formattedPaisa = remainderPaisa.toString().padStart(2, '0')
  const sign = isNegative ? '-' : ''

  return `${sign}Rs ${formattedRupees}.${formattedPaisa}`
}

/**
 * Converts a rupee float/string input into exact integer paisa without float precision errors.
 * e.g. "1234.50" -> 123450, "500" -> 50000
 */
export function rupeesToPaisa(rupees: number | string): number {
  if (typeof rupees === 'number') {
    if (isNaN(rupees)) return 0
    return Math.round(rupees * 100)
  }

  const clean = rupees.replace(/,/g, '').trim()
  if (!clean) return 0

  const parts = clean.split('.')
  const wholePart = parseInt(parts[0] || '0', 10)
  if (isNaN(wholePart)) return 0

  let fractionalPart = 0
  if (parts.length > 1) {
    const fractionStr = parts[1].padEnd(2, '0').slice(0, 2)
    fractionalPart = parseInt(fractionStr, 10) || 0
  }

  const sign = clean.startsWith('-') ? -1 : 1
  return sign * (Math.abs(wholePart) * 100 + fractionalPart)
}

/**
 * Converts integer paisa into decimal rupees string for input display.
 * e.g. 123450 -> "1234.50", 50000 -> "500.00"
 */
export function paisaToRupeesString(paisa: number | null | undefined): string {
  if (paisa === null || paisa === undefined || isNaN(paisa)) return ''
  const absPaisa = Math.abs(Math.round(paisa))
  const rupees = Math.floor(absPaisa / 100)
  const cents = (absPaisa % 100).toString().padStart(2, '0')
  const sign = paisa < 0 ? '-' : ''
  return `${sign}${rupees}.${cents}`
}

/**
 * Standard date formatter for Village Finance.
 * Formats ISO string (YYYY-MM-DD or full timestamp) as "16 Nov 2026"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (isNaN(d.getTime())) return String(date)
    return format(d, 'dd MMM yyyy')
  } catch {
    return String(date)
  }
}
