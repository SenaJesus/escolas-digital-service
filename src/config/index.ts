import 'dotenv/config'
import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(8001),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().default('escolas_org'),
  DB_USER: z.string().default('escolas'),
  DB_PASSWORD: z.string().default('escolas'),

  JWT_SECRET: z.string().min(1).default('change-me-in-production'),
  JWT_EXPIRATION_MINUTES: z.coerce.number().int().positive().default(30),

  SMTP_HOST: z.string().default('smtp.mailersend.net'),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  EMAIL_FROM: z.string().default('escolas.org@example.com'),

  CORS_ORIGIN: z.string().default('*'),
})

const parsed = schema.parse(process.env)

export const config = {
  port: parsed.PORT,
  env: parsed.NODE_ENV,
  database: {
    host: parsed.DB_HOST,
    port: parsed.DB_PORT,
    name: parsed.DB_NAME,
    user: parsed.DB_USER,
    password: parsed.DB_PASSWORD,
  },
  jwt: {
    secret: parsed.JWT_SECRET,
    expirationMinutes: parsed.JWT_EXPIRATION_MINUTES,
  },
  smtp: {
    host: parsed.SMTP_HOST,
    port: parsed.SMTP_PORT,
    user: parsed.SMTP_USER,
    password: parsed.SMTP_PASSWORD,
    from: parsed.EMAIL_FROM,
  },
  cors: {
    origin: parsed.CORS_ORIGIN,
  },
} as const

export type Config = typeof config
