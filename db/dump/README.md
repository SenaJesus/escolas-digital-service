# Dump do banco

O dump do PostgreSQL é grande demais para o GitHub, então ele fica no Google Drive:

https://drive.google.com/drive/folders/1xW9i9H7oysZqCJSKH4wt5ZmPT0NaSiGv?usp=sharing

Baixe o `escolas_digital.dump` e coloque nesta pasta (`db/dump/`). Depois, com o Postgres no ar, restaure:

```bash
docker cp db/dump/escolas_digital.dump escolas-org-postgres:/tmp/dump
docker exec escolas-org-postgres pg_restore -U escolas -d escolas_org --no-owner --clean --if-exists /tmp/dump
```
