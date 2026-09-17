const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const usuarioRoutes = require('./routes/usuarioRoutes');
const manifestacaoRoutes = require('./routes/manifestacaoRoutes');
const respostaRoutes = require('./routes/respostaRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/inicio.html'));
});

app.get('/inicio', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/inicio.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/cadastro.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/api', (req, res) => {
  res.json({
    message: 'API SODA funcionando',
    docs: '/api-docs',
    endpoints: {
      usuarios: '/usuarios',
      manifestacoes: '/manifestacoes',
      respostas: '/respostas'
    }
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/usuarios', usuarioRoutes);
app.use('/manifestacoes', manifestacaoRoutes);
app.use('/respostas', respostaRoutes);

module.exports = app;
