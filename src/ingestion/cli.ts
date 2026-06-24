import { sequelize } from '../shared/database/sequelize'
import '../shared/database/models'

type Ingester = { run: () => Promise<void> }

const loaders: Record<string, () => Promise<Ingester>> = {
  censo: () => import('./censo/ingestCenso'),
  enem: () => import('./enem/ingestEnem'),
  ideb: () => import('./ideb/ingestIdeb'),
  pdde: () => import('./pdde/ingestPdde'),
}

const order = ['censo', 'enem', 'ideb', 'pdde']

const run = async (): Promise<void> => {
  const target = process.argv[2]

  if (!target || (target !== 'all' && !loaders[target])) {
    console.error(`uso: ingest <censo|enem|ideb|pdde|all> (recebido: ${target ?? 'nada'})`)
    process.exit(1)
  }

  await sequelize.authenticate()

  const datasets = target === 'all' ? order : [target]

  for (const dataset of datasets) {
    const loader = loaders[dataset]
    if (!loader) continue

    const module = await loader()
    await module.run()
  }

  await sequelize.close()
}

run().catch((err) => {
  console.error('[ingest] falhou:', err)
  process.exit(1)
})
