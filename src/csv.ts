const CSV_URL = '/rrts.csv'

export type RrtGroup = {
  name: string
  stateTerrUs: string
  regionNote: string
  type: string
  web: string
  phone: string
  email: string
  social: string
  comment: string
}

/** Fetches CSV and parses it. */
export async function fetchCsv(): Promise<RrtGroup[]> {
  const response = await fetch(CSV_URL, { cache: 'no-store' })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch CSV: ${response.status} ${response.statusText}`,
    )
  }
  const text = await response.text()
  const rows = parseCsv(text)
  const rrts: RrtGroup[] = rows
    .map((r) => ({
      name: r['Name'] ?? '',
      stateTerrUs: r['State/Terr./US'] ?? '',
      regionNote: r['Region Note'] ?? '',
      type: r['Type'] ?? '',
      web: r['Web'] ?? '',
      phone: r['Phone'] ?? '',
      email: r['Email'] ?? '',
      social: r['Social'] ?? '',
      comment: r['Comment'] ?? '',
    }))
    .filter((p) => Object.values(p).some((v) => String(v).trim().length > 0))
  return rrts
}

/** Parses CSV text into an array of objects, using the first line as headers. */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
  if (lines.length === 0) return []
  const header = splitCsvLine(lines[0])
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i])
    const row: Record<string, string> = {}
    for (let j = 0; j < header.length; j++) {
      row[header[j]] = cols[j] ?? ''
    }
    rows.push(row)
  }
  return rows
}

/** Minimal CSV line splitter that handles quoted fields and commas within quotes. */
function splitCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
    } else {
      current += char
    }
  }
  values.push(current)
  return values.map((v) => v.trim())
}
