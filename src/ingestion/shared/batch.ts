import type { CreationAttributes, Model, ModelStatic } from 'sequelize'

export const insertInBatches = async <M extends Model>(
  model: ModelStatic<M>,
  rows: ReadonlyArray<CreationAttributes<M>>,
  batchSize = 2000,
): Promise<void> => {
  for (let start = 0; start < rows.length; start += batchSize) {
    const chunk = rows.slice(start, start + batchSize) as CreationAttributes<M>[]
    await model.bulkCreate(chunk)
  }
}
