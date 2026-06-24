# Dados brutos de transparência (`data/`)

Esta pasta guarda os arquivos oficiais baixados das bases públicas (INEP e FNDE) que
alimentam a ingestão. **Os arquivos não são versionados** (`data/` está no `.gitignore`)
porque somam dezenas de GB. Baixe-os das fontes abaixo e coloque cada um na subpasta
correspondente; a ingestão (`npm run ingest:<dataset>`) lê daqui.

A escola é cruzada entre todas as bases pelo **código INEP da escola** (`CO_ENTIDADE`
no Censo, `CO_ESCOLA` no ENEM/PDDE, `ID_ESCOLA` no IDEB), que no banco é `schools.ibge_code`.

## `data/censo/` — Censo Escolar (INEP)
Microdados do Censo Escolar da Educação Básica, um CSV por ano.
- Arquivo: `microdados_ed_basica_AAAA.csv` (ex.: 2019–2023)
- Fonte: https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar
- Formato: `;`, latin1, decimal `,`. O ano é extraído do nome do arquivo.
- Popula: states, cities, schools, school_censuses, accessibilities, internet_access,
  staff_members, quotas, infrastructures, education_records (**reload total**).

## `data/enem/` — ENEM (INEP)
Apenas anos com `CO_ESCOLA` nos microdados entram por escola (2024, 2025) somados ao
agregado oficial por escola (2009–2015). Anos 2016–2023 não têm código de escola e são ignorados.
- `MICRODADOS_ENEM_ESCOLA.csv` — agregado "ENEM por Escola" (2005–2015). Fonte:
  https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem-por-escola
- `RESULTADOS_AAAA.csv` — microdados por participante (2024, 2025). Fonte:
  https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem
- Popula: enem_results (por escola/ano) e enem_aggregates (cidade/estado/Brasil).

## `data/ideb/` — IDEB por escola (INEP)
Planilhas `.xlsx` "por escola", uma por etapa (o arquivo já traz toda a série histórica bienal).
- `divulgacao_anos_iniciais_escolas_AAAA.xlsx` → etapa `early`
- `divulgacao_anos_finais_escolas_AAAA.xlsx` → etapa `late`
- `divulgacao_ensino_medio_escolas_AAAA.xlsx` → etapa `high`
- Fonte: https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/ideb/resultados
- Popula: ideb_scores (ideb, nota padronizada N, indicador de rendimento P, meta).

## `data/pdde/` — Execução Financeira PDDE Básico (FNDE)
CSV (`.txt.gz`, `;`, latin1) por ano, com repasses por entidade/escola.
- `PDDE_Execucao_Financeira_PDDE_Basico_Publico_AAAA.txt.gz` (2021–2024)
- Fonte: https://dados.gov.br/dados/conjuntos-dados/programa-dinheiro-direto-na-escola-pdde
- Popula: pdde_transfers (custeio/capital/total por escola/ano) e pdde_programs.
