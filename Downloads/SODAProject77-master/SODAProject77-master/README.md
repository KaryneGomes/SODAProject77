# SODA Backend

Backend Node.js para o aplicativo de manifestações. Este projeto inclui autenticação JWT, CRUD das entidades principais, validações, regras de negócio e documentação Swagger.

## Instalação

1. Copie `.env.example` para `.env` para executar o backend localmente.
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

## Usar o app em vários celulares

Para os celulares acessarem a mesma API sem depender do IP de um computador:

1. Crie um banco PostgreSQL no Neon e copie a connection string. O plano gratuito do PostgreSQL do Render expira após 30 dias; por isso o banco fica no Neon.
2. Publique este repositório no GitHub e crie um Blueprint no Render usando o arquivo `render.yaml`. Informe a connection string do Neon quando o Render solicitar `DATABASE_URL`. O Blueprint gera `JWT_SECRET` automaticamente.
3. Após o deploy, copie a URL HTTPS do serviço do Render.
4. Copie `mobile/.env.example` para `mobile/.env` e substitua o valor por essa URL:

   ```env
   EXPO_PUBLIC_API_BASE_URL=https://sua-api.onrender.com
   ```

5. Inicie o app em `mobile` com `npx expo start --tunnel` e abra o QR Code no Expo Go. O computador que executa o Expo precisa permanecer ligado enquanto os celulares usarem esse servidor de desenvolvimento. A API, por outro lado, fica hospedada e compartilhada pela internet.

O Render gratuito pode suspender a API quando fica sem uso, e o Neon pausa o banco após inatividade; a primeira requisição depois de uma pausa pode demorar. Mantenha `DATABASE_URL` e `JWT_SECRET` somente nas variáveis privadas do Render, nunca no app ou no repositório.

## Entregas do backend

- Modelagem conceitual e relacional do banco de dados
- Conexão com banco
- CRUD das entidades principais e complementares
- Autenticação e autorização
- Regras de negócio e validações
- Documentação da API
  
"# SODAProject" 
"# SODAProject" 
