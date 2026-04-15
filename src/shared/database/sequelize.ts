import { Sequelize } from 'sequelize'
import { config } from '../../config'

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  logging: config.env === 'development' ? console.log : false,
  define: {
    timestamps: false,
    freezeTableName: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30_000,
    idle: 10_000,
  },
})
