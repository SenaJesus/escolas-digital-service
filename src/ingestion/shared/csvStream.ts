import { createReadStream } from 'node:fs'
import { createGunzip } from 'node:zlib'
import { parse } from 'csv-parse'
import iconv from 'iconv-lite'

export type CsvRow = Record<string, string>

type StreamOptions = {
  delimiter?: string
  encoding?: string
  gzip?: boolean
}

export const streamCsv = async (
  filePath: string,
  onRow: (row: CsvRow, index: number) => void | Promise<void>,
  options: StreamOptions = {},
): Promise<number> => {
  const delimiter = options.delimiter ?? ';'
  const encoding = options.encoding ?? 'latin1'
  const gzip = options.gzip ?? filePath.endsWith('.gz')

  const fileStream = createReadStream(filePath)
  const byteStream = gzip ? fileStream.pipe(createGunzip()) : fileStream

  const parser = byteStream.pipe(iconv.decodeStream(encoding)).pipe(
    parse({
      delimiter,
      columns: true,
      bom: true,
      relax_quotes: true,
      relax_column_count: true,
      skip_empty_lines: true,
      trim: true,
    }),
  )

  let index = 0

  for await (const record of parser) {
    await onRow(record as CsvRow, index)
    index += 1
  }

  return index
}
