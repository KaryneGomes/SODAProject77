const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Manifestacao, Resposta } = require('../models');

require('dotenv').config();

const EMAIL_FORMATO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailInstitucionalValido(email, tipoUsuario) {
  if (typeof email !== 'string' || !EMAIL_FORMATO_VALIDO.test(email)) return false;
  const dominio = email.trim().toLowerCase().split('@')[1];
  if (tipoUsuario === 'aluno') return dominio === 'discente.ifpe.edu.br';
  return dominio === 'ifpe.edu.br' || (dominio.endsWith('.ifpe.edu.br') && dominio !== 'discente.ifpe.edu.br');
}

function emailInstitucionalEsperado(tipoUsuario) {
  return tipoUsuario === 'aluno'
    ? 'Use seu e-mail institucional @discente.ifpe.edu.br.'
    : 'Use seu e-mail institucional @ifpe.edu.br ou o domínio oficial do seu campus.';
}

function temSeteDigitos(valor) {
  return valor !== undefined && valor !== null && /^\d{7}$/.test(String(valor).trim());
}


// ===============================
// CADASTRAR USUÁRIO
// ===============================

exports.cadastrar = async (req, res) => {
  try {

    const {
      nome,
      email,
      senha,
      tipoUsuario,
      matricula,
      curso,
      periodo,
      disciplina,
      siape,
      cargo
    } = req.body;


    // Verificar campos obrigatórios
    if (typeof nome !== 'string' || !nome.trim() || typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha || !tipoUsuario) {
      return res.status(400).json({
        erro: 'Nome, email, senha e tipo de usuário são obrigatórios'
      });
    }


    // Verificar tipo de usuário
    const tiposPermitidos = [
      'aluno',
      'professor',
      'servidor',
      'coordenador'
    ];

    if (!tiposPermitidos.includes(tipoUsuario)) {
      return res.status(400).json({
        erro: 'Tipo de usuário inválido'
      });
    }


    const emailNormalizado = email.trim().toLowerCase();

    if (!emailInstitucionalValido(emailNormalizado, tipoUsuario)) {
      return res.status(400).json({ erro: emailInstitucionalEsperado(tipoUsuario) });
    }

    const camposObrigatoriosPorPerfil = {
      aluno: [matricula, curso, periodo],
      professor: [matricula, disciplina],
      servidor: [siape || matricula, cargo],
      coordenador: [matricula, curso],
    };
    if (camposObrigatoriosPorPerfil[tipoUsuario].some((valor) => valor === undefined || valor === null || !String(valor).trim())) {
      return res.status(400).json({ erro: 'Preencha todos os dados obrigatórios do perfil escolhido.' });
    }

    if (tipoUsuario !== 'servidor' && !temSeteDigitos(matricula)) {
      return res.status(400).json({ erro: 'A matrícula IFPE deve ter exatamente 7 números.' });
    }
    if (tipoUsuario === 'servidor' && !temSeteDigitos(siape || matricula)) {
      return res.status(400).json({ erro: 'O SIAPE deve ter exatamente 7 números.' });
    }
    if (matricula && !temSeteDigitos(matricula)) {
      return res.status(400).json({ erro: 'A matrícula deve ter exatamente 7 números.' });
    }
    if (tipoUsuario === 'servidor' && siape && !temSeteDigitos(siape)) {
      return res.status(400).json({ erro: 'O SIAPE deve ter exatamente 7 números.' });
    }

    // Verificar tamanho da senha
    if (senha.length < 8) {
      return res.status(400).json({
        erro: 'A senha deve ter pelo menos 8 caracteres'
      });
    }


    // Verificar se email já existe
    const existe = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (existe) {
      return res.status(400).json({
        erro: 'Email já cadastrado'
      });
    }


    // Criptografar senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);


    // Criar usuário
    const usuario = await Usuario.create({

      nome,
      email: emailNormalizado,

      senha: senhaCriptografada,

      tipoUsuario,

      matricula: matricula || null,

      curso: curso || null,

      periodo: periodo || null,

      disciplina: disciplina || null,

      siape: tipoUsuario === 'servidor' ? (siape || null) : null,

      cargo: cargo || null

    });


    return res.status(201).json({

      mensagem: 'Usuário criado com sucesso',

      usuario: {
        id: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
        matricula: usuario.matricula,
        curso: usuario.curso,
        periodo: usuario.periodo,
        disciplina: usuario.disciplina,
        siape: usuario.siape,
        cargo: usuario.cargo
      }

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      erro: error.message
    });

  }
};


// ===============================
// LOGIN
// ===============================

exports.login = async (req, res) => {

  try {

    const {
      email,
      senha
    } = req.body;


    if (typeof email !== 'string' || !email.trim() || typeof senha !== 'string' || !senha) {

      return res.status(400).json({
        erro: 'Email e senha são obrigatórios'
      });

    }


    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() }
    });


    if (!usuario) {

      return res.status(404).json({
        erro: 'Usuário não encontrado'
      });

    }


    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha
    );


    if (!senhaValida) {

      return res.status(401).json({
        erro: 'Senha incorreta'
      });

    }


    const token = jwt.sign(

      {
        idUsuario: usuario.idUsuario,
        tipo: usuario.tipoUsuario
      },

      process.env.JWT_SECRET || 'soda123',

      {
        expiresIn: '8h'
      }

    );


    return res.json({

      mensagem: 'Login realizado',

      token,

      usuario: {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario
      }

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      erro: error.message
    });

  }

};


// ===============================
// LISTAR USUÁRIOS
// ===============================

exports.listar = async (req, res) => {

  try {

    const usuarios = await Usuario.findAll({

      attributes: [
        'idUsuario',
        'nome',
        'email',
        'tipoUsuario',
        'fotoPerfil',
        'matricula',
        'curso',
        'periodo',
        'disciplina',
        'siape',
        'cargo',
        'createdAt',
        'updatedAt'
      ]

    });


    return res.json(usuarios);

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    });

  }

};


// ===============================
// BUSCAR USUÁRIO
// ===============================

exports.buscar = async (req, res) => {

  try {

    const id = parseInt(
      req.params.id,
      10
    );


    if (!id) {

      return res.status(400).json({
        erro: 'ID inválido'
      });

    }


    if (
      req.usuario.idUsuario !== id &&
      req.usuario.tipo !== 'admin'
    ) {

      return res.status(403).json({
        erro: 'Acesso negado'
      });

    }


    const usuario = await Usuario.findByPk(id, {

      attributes: [
        'idUsuario',
        'nome',
        'email',
        'tipoUsuario',
        'fotoPerfil',
        'matricula',
        'curso',
        'periodo',
        'disciplina',
        'siape',
        'cargo',
        'createdAt',
        'updatedAt'
      ]

    });


    if (!usuario) {

      return res.status(404).json({
        erro: 'Usuário não encontrado'
      });

    }


    return res.json(usuario);

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    });

  }

};

exports.fotoPerfil = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    // Fotos são exibidas no feed público apenas para autores e respondentes
    // que aparecem em manifestações visíveis nesse feed.
    const autorPublicado = await Manifestacao.findOne({
      attributes: ['idManifestacao'],
      where: { idUsuario: id },
    });
    const respondentePublicado = autorPublicado || await Resposta.findOne({
      attributes: ['idResposta'],
      where: { idUsuario: id },
      include: [{ model: Manifestacao, attributes: ['idManifestacao'], required: true }],
    });
    if (!respondentePublicado) {
      return res.status(404).json({ erro: 'Foto de perfil não encontrada' });
    }

    const usuario = await Usuario.findByPk(id, { attributes: ['fotoPerfil'] });
    if (!usuario?.fotoPerfil) {
      return res.status(404).json({ erro: 'Foto de perfil não encontrada' });
    }

    const imagem = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/i.exec(usuario.fotoPerfil);
    if (!imagem) {
      return res.status(404).json({ erro: 'Foto de perfil inválida' });
    }

    return res
      .set('Cache-Control', 'private, max-age=3600')
      .type(imagem[1])
      .send(Buffer.from(imagem[2], 'base64'));
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};


// ===============================
// EDITAR USUÁRIO
// ===============================

exports.editar = async (req, res) => {

  try {

    const id = parseInt(
      req.params.id,
      10
    );


    const {
      nome,
      email,
      senha,
      tipoUsuario,
      matricula,
      curso,
      periodo,
      disciplina,
      siape,
      cargo,
      fotoPerfil
    } = req.body;


    if (!id) {

      return res.status(400).json({
        erro: 'ID inválido'
      });

    }


    if (
      req.usuario.idUsuario !== id &&
      req.usuario.tipo !== 'admin'
    ) {

      return res.status(403).json({
        erro: 'Acesso negado'
      });

    }


    const usuario = await Usuario.findByPk(id);


    if (!usuario) {

      return res.status(404).json({
        erro: 'Usuário não encontrado'
      });

    }


    const emailNormalizado = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // Validar o endereço somente quando ele for alterado para manter contas antigas acessíveis.
    const emailAtualNormalizado = String(usuario.email || '').trim().toLowerCase();
    if (emailNormalizado && emailNormalizado !== emailAtualNormalizado) {
      if (!emailInstitucionalValido(emailNormalizado, usuario.tipoUsuario)) {
        return res.status(400).json({ erro: emailInstitucionalEsperado(usuario.tipoUsuario) });
      }

      if (matricula !== undefined && String(matricula).trim() !== String(usuario.matricula || '').trim() && String(matricula).trim() && !temSeteDigitos(matricula)) {
        return res.status(400).json({ erro: 'A matrícula deve ter exatamente 7 números.' });
      }
      if (usuario.tipoUsuario === 'servidor' && siape !== undefined && String(siape).trim() !== String(usuario.siape || '').trim() && String(siape).trim() && !temSeteDigitos(siape)) {
        return res.status(400).json({ erro: 'O SIAPE deve ter exatamente 7 números.' });
      }

      const existe = await Usuario.findOne({
        where: { email: emailNormalizado }
      });


      if (existe) {

        return res.status(400).json({
          erro: 'Email já cadastrado'
        });

      }

    }


    const atualizacoes = {};

    if (fotoPerfil !== undefined) {
      if (fotoPerfil !== null) {
        const fotoValida = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(fotoPerfil);
        if (!fotoValida) {
          return res.status(400).json({ erro: 'A foto precisa estar em JPEG, PNG ou WebP.' });
        }
        if (fotoPerfil.length > 7 * 1024 * 1024) {
          return res.status(413).json({ erro: 'A foto deve ter até aproximadamente 5 MB.' });
        }
      }
      atualizacoes.fotoPerfil = fotoPerfil;
    }


    if (nome) {
      atualizacoes.nome = nome;
    }


    if (emailNormalizado && emailNormalizado !== emailAtualNormalizado) {
      atualizacoes.email = emailNormalizado;
    }


    if (matricula !== undefined) {
      if (String(matricula).trim() !== String(usuario.matricula || '').trim() && String(matricula).trim() && !temSeteDigitos(matricula)) {
        return res.status(400).json({ erro: 'A matrícula deve ter exatamente 7 números.' });
      }
      atualizacoes.matricula = matricula;
    }


    if (curso !== undefined) {
      atualizacoes.curso = curso;
    }


    if (periodo !== undefined) {
      atualizacoes.periodo = periodo;
    }


    if (disciplina !== undefined) {
      atualizacoes.disciplina = disciplina;
    }


    if (siape !== undefined && usuario.tipoUsuario === 'servidor') {
      if (String(siape).trim() !== String(usuario.siape || '').trim() && String(siape).trim() && !temSeteDigitos(siape)) {
        return res.status(400).json({ erro: 'O SIAPE deve ter exatamente 7 números.' });
      }
      atualizacoes.siape = siape;
    }


    if (cargo !== undefined) {
      atualizacoes.cargo = cargo;
    }


    // Somente admin pode alterar tipo
    if (
      tipoUsuario &&
      req.usuario.tipo === 'admin'
    ) {

      const tiposPermitidos = [
        'aluno',
        'professor',
        'servidor',
        'coordenador',
        'admin'
      ];


      if (!tiposPermitidos.includes(tipoUsuario)) {

        return res.status(400).json({
          erro: 'Tipo de usuário inválido'
        });

      }


      atualizacoes.tipoUsuario = tipoUsuario;

    }


    // Alterar senha
    if (senha) {

      if (senha.length < 8) {

        return res.status(400).json({
          erro: 'A senha deve ter pelo menos 8 caracteres'
        });

      }


      atualizacoes.senha =
        await bcrypt.hash(senha, 10);

    }


    await usuario.update(atualizacoes);


    return res.json({

      mensagem: 'Usuário atualizado com sucesso'

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      erro: error.message
    });

  }

};


// ===============================
// EXCLUIR USUÁRIO
// ===============================

exports.excluir = async (req, res) => {

  try {

    const id = parseInt(
      req.params.id,
      10
    );


    if (!id) {

      return res.status(400).json({
        erro: 'ID inválido'
      });

    }


    const usuario = await Usuario.findByPk(id);


    if (!usuario) {

      return res.status(404).json({
        erro: 'Usuário não encontrado'
      });

    }


    await usuario.destroy();


    return res.json({

      mensagem: 'Usuário excluído com sucesso'

    });

  } catch (error) {

    return res.status(500).json({
      erro: error.message
    });

  }

};
