# Rodar no Desktop (Windows)

## Pré-requisitos
- Node.js (LTS) + npm
- Git (opcional)
- Postgres (opcional, se quiser rodar com banco real)
  - host: localhost
  - port: 5432
  - database: cap_management
  - user: postgres

## Instalação
```bash
npm install
```

Se o comando `cds` não existir no seu terminal:
```bash
npm install -g @sap/cds-dk
```

## Rodar rápido com SQLite (recomendado para desenvolvimento local)
1) Deploy do modelo e dados seed:
```bash
npx cds deploy '*' --profile sqlite
```

2) Subir o servidor e abrir o app:
```bash
npm run watch-btp_ui_customer
```

## Rodar com Postgres
1) Garanta que o Postgres está rodando e que existe o banco `cap_management`.

2) Informe a senha do usuário do Postgres (duas opções):
- Opção A (recomendada): variável de ambiente
  - `CDS_REQUIRES_DB_CREDENTIALS_PASSWORD`
- Opção B: arquivo local `.cdsrc-private.json`
  - copie `.cdsrc-private.json.example` para `.cdsrc-private.json` e edite a senha
  - não faça commit desse arquivo

3) Deploy no Postgres:
```bash
npx cds deploy '*' --profile postgres
```

4) Subir o servidor e abrir o app:
```bash
npm run watch-postgres-btp_ui_customer
```

## URLs úteis
- App freestyle (Customers/Products):  
  `http://localhost:4004/btp_ui_customer/webapp/index.html?sap-ui-xx-viewCache=false`
- OData sem Draft (usado pelo app freestyle):  
  `http://localhost:4004/odata/v4/service/cap-nodraft/`
- OData com Draft (para Fiori Elements):  
  `http://localhost:4004/odata/v4/service/cap/`

## Como saber se está no Postgres ou SQLite
- Olhe o log do servidor:
  - `connect to db > postgres` = está no Postgres
  - `connect to db > sqlite` = está no SQLite

## Consultar dados no Postgres
1) Descobrir o nome real da tabela (se necessário):
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename ILIKE '%customers%';
```

2) Consultar Customers/Products (ajuste o nome da tabela se necessário):
```sql
SELECT * FROM "cap_management_Customers" ORDER BY "createdAt" DESC LIMIT 50;
SELECT * FROM "cap_management_Products" ORDER BY "createdAt" DESC LIMIT 50;
```

## Testes rápidos via HTTP
- Use o arquivo `catalog.http` para testar GET/POST/PATCH/DELETE no endpoint sem Draft.
