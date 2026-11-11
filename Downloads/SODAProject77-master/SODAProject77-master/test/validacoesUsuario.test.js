const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validarEmailIFPE,
  validarSenha,
  validarMatricula,
  validarSiape,
  validarCadastroUsuario,
} = require('../src/utils/validacoesUsuario');

test('aceita e-mail institucional do IFPE', () => {
  assert.equal(validarEmailIFPE('aluno@ifpe.edu.br'), true);
  assert.equal(validarEmailIFPE('joao.silva@discente.ifpe.edu.br'), true);
});

test('rejeita e-mail fora do IFPE', () => {
  assert.equal(validarEmailIFPE('aluno@gmail.com'), false);
  assert.equal(validarEmailIFPE('email@outro.com'), false);
});

test('rejeita senha fraca', () => {
  assert.equal(validarSenha('12345678'), false);
  assert.equal(validarSenha('Senha123'), true);
});

test('valida matricula numerica', () => {
  assert.equal(validarMatricula('20240123'), true);
  assert.equal(validarMatricula('ABC123'), false);
});

test('valida siape numerico', () => {
  assert.equal(validarSiape('123456'), true);
  assert.equal(validarSiape('12345A'), false);
});

test('valida requisitos de cadastro completo', () => {
  assert.deepEqual(validarCadastroUsuario({
    nome: 'Ana Souza',
    email: 'ana@ifpe.edu.br',
    senha: 'Senha123',
    tipoUsuario: 'aluno',
    matricula: '20240123',
    siape: undefined,
  }), { ok: true });

  assert.equal(validarCadastroUsuario({
    nome: 'Ana Souza',
    email: 'ana@gmail.com',
    senha: 'Senha123',
    tipoUsuario: 'aluno',
    matricula: '20240123',
    siape: undefined,
  }).ok, false);
});
