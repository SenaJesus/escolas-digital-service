# escolas.digital - API

API REST do escolas.digital, uma plataforma com dados públicos sobre escolas brasileiras. Ela permite buscar instituições por estado, cidade, bairro e nome, ler e escrever avaliações, criar conta de usuário, se inscrever em atualizações de uma escola e consultar dados oficiais de Censo Escolar, ENEM, IDEB e do Programa Dinheiro Direto na Escola. Projeto da disciplina SCC0219 (Introdução ao Desenvolvimento Web) do ICMC-USP.

A API usa Node.js com TypeScript, Express, Sequelize sobre PostgreSQL 16, zod na validação, JSON Web Tokens na autenticação, bcrypt nas senhas, Nodemailer no envio de e-mails e MinIO (um S3 local) para guardar as imagens das escolas. O código fica em `src/features`, um domínio por pasta (location, school, auth, review, enem, ideb, pdde, subscription, notification, user, school-image), cada um separado em domínio, infraestrutura e apresentação. A ingestão dos dados públicos fica em `src/ingestion`.

## Pré-requisitos

- Node.js 20 ou superior
- Docker e Docker Compose

## Subindo o ambiente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie o arquivo de exemplo para `.env`. Os valores padrão já funcionam para desenvolvimento:

   ```bash
   cp .env.example .env
   ```

3. Suba o Postgres e o MinIO juntos:

   ```bash
   docker compose up -d
   ```

   Isso cria dois containers: `escolas-org-postgres` (banco, porta 5433) e `escolas-org-minio` (S3 local, porta 9000 para a API e 9001 para o console). O bucket de imagens (`escolas-images`) é criado automaticamente quando a API inicia, então não é preciso configurar nada no MinIO.

## Populando o banco

Escolha uma das duas opções abaixo.

### Opção A: restaurar o dump (mais rápida)

O dump tem todas as tabelas e os dados reais (244 mil escolas, censo, ENEM, IDEB e PDDE). Ele é grande demais para o GitHub, então fica no Google Drive (link em `db/dump/README.md`). Baixe o `escolas_digital.dump` e coloque na pasta `db/dump/`. Com o Postgres no ar, copie o dump para dentro do container e restaure:

```bash
docker cp db/dump/escolas_digital.dump escolas-org-postgres:/tmp/dump
docker exec escolas-org-postgres pg_restore -U escolas -d escolas_org --no-owner --clean --if-exists /tmp/dump
```

O dump já inclui as migrations aplicadas, então não precisa rodar mais nada no banco.

### Opção B: reconstruir do zero a partir das fontes oficiais

Foi assim que o dump foi gerado. Primeiro crie a estrutura do banco:

```bash
npm run db:migrate
```

Depois baixe os arquivos e coloque cada um na subpasta certa de `data/`. O link do Google Drive de cada base está no README dentro da subpasta (`data/censo`, `data/enem`, `data/ideb`, `data/pdde`), e o `data/README.md` traz também as fontes oficiais (INEP e FNDE). Com os arquivos no lugar, rode tudo de uma vez:

```bash
npm run ingest:all
```

Ou um dataset por vez:

```bash
npm run ingest:censo
npm run ingest:enem
npm run ingest:ideb
npm run ingest:pdde
```

A ingestão do censo recria estados, cidades, escolas e censos a partir dos microdados. Os outros datasets cruzam cada escola pelo código INEP (`schools.ibge_code`) e populam ENEM, IDEB e os repasses do PDDE. São vários milhões de registros, então leva alguns minutos por dataset.

Por fim, crie o usuário administrador (na Opção A ele já vem no dump):

```bash
npm run seed:admin
```

## Rodando a API

```bash
npm run dev
```

A API sobe em `http://127.0.0.1:8001`. O endpoint `GET /health` responde 200 quando ela está pronta. O frontend espera a API nessa URL por padrão.

## E-mails em desenvolvimento

Com `SMTP_USER` vazio (padrão do `.env.example`), os e-mails de confirmação não saem de verdade. A API cria uma caixa de teste no Ethereal a cada boot e imprime no console (`npm run dev`) o login dessa caixa e um link de preview a cada e-mail enviado. Para pegar um código, é só abrir a linha `[email] Preview: ...` do console.

## Acesso de administrador

O comando `npm run seed:admin` cria (ou atualiza) o administrador:

```
email: admin@escolas.digital
senha: admin123
```

Logado como admin, a interface mostra a opção `Admin` no menu da conta, com a lista de usuários. Ali você marca quais usuários podem editar fotos e de quais escolas. O admin também pode editar a foto de qualquer escola e apagar qualquer avaliação. Para trocar a senha do admin, mude `ADMIN_PASSWORD` em `src/scripts/seedAdmin.ts` e rode `npm run seed:admin` de novo.

## Imagens das escolas (S3 local)

As imagens enviadas pelos usuários vão para o MinIO. Para ver os arquivos, abra o console em `http://localhost:9001` e entre com usuário `escolas` e senha `escolas-secret`.

## Comandos úteis

```bash
npm run typecheck   # checa a tipagem do TypeScript
npm run lint        # ESLint
npm run test        # testes com Vitest
npm run format      # Prettier
npm run build       # compila para dist/
npm start           # roda a versão compilada
```
