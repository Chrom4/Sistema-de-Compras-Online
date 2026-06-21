# Sistema de Compras Online

Projeto desenvolvido para gerenciamento de vendas online, contendo frontend em React e backend em Node.js com banco de dados MySQL.

## Tecnologias Utilizadas

### Frontend

* React
* React Router
* React Icons
* Vite

### Backend

* Node.js
* Express
* JWT
* Bcrypt
* MySQL2

### Banco de Dados

* MySQL

---

## Pré-requisitos

Instale os seguintes softwares:

* Node.js 18+
* MySQL 8+
* Git

Verifique as versões:

```bash
node -v
npm -v
mysql --version
```

---

## Configuração do Banco de Dados

O projeto acompanha um arquivo de dump SQL contendo toda a estrutura do banco de dados e, quando aplicável, dados iniciais para testes.

### Importando o banco

1. Crie um banco de dados vazio no MySQL:

```sql
CREATE DATABASE online_shopping;
```

2. Importe o arquivo de dump fornecido junto ao projeto:

```bash
mysql -u root -p online_shopping < online_shopping_dump.sql
```

ou utilize a ferramenta de importação do MySQL Workbench.
Após a importação do dump, o banco estará pronto para utilização.


## Configuração do Backend

Acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env`:

```env
HTTP_PORT=3001
DB_HOST=localhost
DB_USER=usuario
DB_PASSWORD=1234
DB_NAME=online_shopping
JWT_SECRET=supersecret
JWT_EXPIRES_IN=1h
```

Inicie o servidor:

```bash
npm start
```

ou

```bash
npm run dev
```

O backend ficará disponível em:

```txt
http://localhost:3001
```

---

## Configuração do Frontend

Acesse a pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie a aplicação:

```bash
npm run dev
```

O frontend ficará disponível em:

```txt
http://localhost:5173
```

---

## Usuários do Sistema

O sistema possui os seguintes perfis:

* Cliente
* Atendente
* Administrador

---

## Funcionalidades

### Cliente

* Cadastro
* Login
* Carrinho de compras
* Cadastro de endereços
* Finalização de pedidos
* Pagamento

### Atendente

* Cadastro de vendas por telefone
* Registro de pagamentos
* Gerenciamento de pedidos
* Cadastro de endereços para pedidos

### Administrador

* Gerenciamento de usuários
* Gerenciamento de produtos
* Relatórios e consultas

---

## Segurança

* Senhas armazenadas utilizando bcrypt.
* Autenticação baseada em JWT.
* Controle de acesso por perfil.

---

## Estrutura do Projeto

```txt
frontend/
├── src/
├── public/
└── package.json

backend/
├── src
├── .env
└── package.json
```

---

## Executando o Projeto

Abra dois terminais.

### Terminal 1

```bash
cd backend
npm run dev
```

### Terminal 2

```bash
cd frontend
npm run dev
```

Acesse:

```txt
http://localhost:5173
```

