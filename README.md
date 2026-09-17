# SODA Backend

Backend Node.js para o aplicativo de manifestações. Este projeto inclui autenticação JWT, CRUD das entidades principais, validações, regras de negócio e documentação Swagger.

## Instalação

1. Copie o arquivo `.env` com as configurações padrão.
2. Instale as dependências:

```bash
npm install
```

3. Execute o backend:

```bash
npm run dev
```

## Rotas principais

- `POST /usuarios/cadastro` - registra um novo usuário
- `POST /usuarios/login` - autentica e retorna token JWT
- `GET /usuarios` - lista usuários (admin)
- `GET /usuarios/:id` - busca usuário (próprio ou admin)
- `PUT /usuarios/:id` - atualiza usuário (próprio ou admin)
- `DELETE /usuarios/:id` - remove usuário (admin)

- `POST /manifestacoes` - cria manifestação (autenticado)
- `GET /manifestacoes` - lista manifestações
- `GET /manifestacoes/:id` - busca manifestação por id
- `PUT /manifestacoes/:id` - atualiza manifestação (autor ou admin)
- `DELETE /manifestacoes/:id` - remove manifestação (autor ou admin)

- `POST /respostas` - cria resposta (admin)
- `GET /respostas` - lista respostas (autenticado)
- `GET /respostas/:id` - busca resposta por id (autenticado)
- `PUT /respostas/:id` - atualiza resposta (autor ou admin)
- `DELETE /respostas/:id` - remove resposta (admin)

## Documentação Swagger

Acesse a documentação no:

- `http://localhost:3000/api-docs`

## Banco de dados

O projeto usa SQLite por padrão com arquivo `soda.sqlite`.

## Entregas do backend

- Modelagem conceitual e relacional do banco de dados
- Conexão com banco
- CRUD das entidades principais e complementares
- Autenticação e autorização
- Regras de negócio e validações
- Documentação da API
  
"# SODAProject" 
"# SODAProject" 
