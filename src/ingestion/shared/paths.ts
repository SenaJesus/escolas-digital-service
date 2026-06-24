import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

export const dataDir = (...segments: string[]): string =>
  path.resolve(process.cwd(), 'data', ...segments)

export const exists = (target: string): boolean => existsSync(target)

export const listFiles = (dir: string): string[] => {
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((name) => !name.startsWith('.'))
    .map((name) => path.join(dir, name))
}

export const log = (scope: string, message: string): void => {
  console.log(`[ingest:${scope}] ${message}`)
}
