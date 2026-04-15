require('dotenv').config()

const base = {
  username: process.env.DB_USER || 'escolas',
  password: process.env.DB_PASSWORD || 'escolas',
  database: process.env.DB_NAME || 'escolas_org',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
}

module.exports = {
  development: base,
  test: { ...base, database: `${base.database}_test` },
  production: base,
}
