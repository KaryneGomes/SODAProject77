const EMAIL_IFPE_REGEX = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*ifpe\.edu\.br$/i;
const SENHA_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const MATRICULA_REGEX = /^\d{7,12}$/;
const SIAPE_REGEX = /^\d{6,10}$/;

function normalizarTexto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarNome(nome) {
  const valor = normalizarTexto(nome);
  return valor.length >= 2 && valor.length <= 120;
}

function validarEmailIFPE(email) {
  const valor = normalizarTexto(email).toLowerCase();
  return EMAIL_IFPE_REGEX.test(valor);
}

function validarSenha(senha) {
  const valor = normalizarTexto(senha);
  return SENHA_REGEX.test(valor);
}

function validarMatricula(matricula) {
  const valor = normalizarTexto(matricula);
  return MATRICULA_REGEX.test(valor);
}

function validarSiape(siape) {
  const valor = normalizarTexto(siape);
  return SIAPE_REGEX.test(valor);
}

function validarCadastroUsuario({ nome, email, senha, tipoUsuario, matricula, siape }) {
  if (!validarNome(nome)) {
    return { ok: false, erro: 'Informe um nome válido com pelo menos 2 caracteres.' };
  }

  if (!validarEmailIFPE(email)) {
    return { ok: false, erro: 'Use um e-mail institucional do IFPE, com domínio @ifpe.edu.br.' };
  }

  if (!validarSenha(senha)) {
    return { ok: false, erro: 'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula e número.' };
  }

  const tiposPermitidos = ['aluno', 'professor', 'servidor', 'coordenador'];
  if (!tiposPermitidos.includes(tipoUsuario)) {
    return { ok: false, erro: 'Tipo de usuário inválido.' };
  }

  if (tipoUsuario === 'servidor') {
    if (!validarSiape(siape)) {
      return { ok: false, erro: 'SIAPE inválido. Use somente números, com 6 a 10 dígitos.' };
    }
    return { ok: true };
  }

  if (!validarMatricula(matricula)) {
    return { ok: false, erro: 'Matrícula inválida. Use somente números, com 7 a 12 dígitos.' };
  }

  return { ok: true };
}

module.exports = {
  EMAIL_IFPE_REGEX,
  SENHA_REGEX,
  MATRICULA_REGEX,
  SIAPE_REGEX,
  normalizarTexto,
  validarNome,
  validarEmailIFPE,
  validarSenha,
  validarMatricula,
  validarSiape,
  validarCadastroUsuario,
};
