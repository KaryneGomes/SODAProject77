const { podeResponderManifestacao } = require('./src/utils/permissoesOuvidoria');

const cases = [
  ['professor', 'aluno', true],
  ['coordenador', 'professor', true],
  ['servidor', 'aluno', true],
  ['aluno', 'aluno', false],
  ['professor', 'professor', false],
  ['servidor', 'coordenador', true],
  ['coordenador', 'servidor', false],
  ['admin', 'aluno', true]
];

const ok = cases.every(([responde, autor, expected]) => {
  const result = podeResponderManifestacao({ tipoUsuario: responde }, { tipoUsuario: autor });
  return result === expected;
});

if (!ok) {
  throw new Error('Falha na validação de permissões');
}

console.log('Permissões validadas com sucesso: ' + cases.length + ' casos');
