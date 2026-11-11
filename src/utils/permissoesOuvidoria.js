const PERMISSOES_RESPOSTA = {
  aluno: ['professor', 'coordenador', 'servidor', 'admin'],
  professor: ['aluno'],
  coordenador: ['servidor', 'admin'],
  servidor: ['coordenador', 'admin'],
  admin: ['aluno', 'professor', 'coordenador', 'servidor', 'admin']
};

function normalizarTipo(tipoUsuario) {
  return String(tipoUsuario || '').trim().toLowerCase();
}

function podeResponderManifestacao(usuario, autorManifestacao) {
  const tipoUsuario = normalizarTipo(usuario?.tipoUsuario || usuario?.tipo);
  const tipoAutor = normalizarTipo(autorManifestacao?.tipoUsuario || autorManifestacao?.tipo || autorManifestacao);

  if (!tipoUsuario || !tipoAutor) return false;
  if (tipoUsuario === 'admin') return true;
  if (tipoUsuario === tipoAutor) return false;

  const permissoes = PERMISSOES_RESPOSTA[tipoUsuario] || [];
  return permissoes.includes(tipoAutor);
}

module.exports = {
  PERMISSOES_RESPOSTA,
  podeResponderManifestacao,
  normalizarTipo
};
