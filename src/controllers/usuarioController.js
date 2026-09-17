const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

require('dotenv').config();


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
    if (!nome || !email || !senha || !tipoUsuario) {
      return res.status(400).json({
        erro: 'Nome, email, senha e tipo de usuário são obrigatórios'
      });
    }


    // Verificar tipo de usuário
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


    // Verificar tamanho da senha
    if (senha.length < 6) {
      return res.status(400).json({
        erro: 'A senha deve ter pelo menos 6 caracteres'
      });
    }


    // Verificar se email já existe
    const existe = await Usuario.findOne({
      where: { email }
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
      email,

      senha: senhaCriptografada,

      tipoUsuario,

      matricula: matricula || null,

      curso: curso || null,

      periodo: periodo || null,

      disciplina: disciplina || null,

      siape: siape || null,

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


    if (!email || !senha) {

      return res.status(400).json({
        erro: 'Email e senha são obrigatórios'
      });

    }


    const usuario = await Usuario.findOne({
      where: { email }
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
      cargo
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


    // Verificar email
    if (
      email &&
      email !== usuario.email
    ) {

      const existe = await Usuario.findOne({
        where: { email }
      });


      if (existe) {

        return res.status(400).json({
          erro: 'Email já cadastrado'
        });

      }

    }


    const atualizacoes = {};


    if (nome) {
      atualizacoes.nome = nome;
    }


    if (email) {
      atualizacoes.email = email;
    }


    if (matricula !== undefined) {
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


    if (siape !== undefined) {
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

      if (senha.length < 6) {

        return res.status(400).json({
          erro: 'A senha deve ter pelo menos 6 caracteres'
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