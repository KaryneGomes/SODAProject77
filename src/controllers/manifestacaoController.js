const { Manifestacao, Usuario, Resposta } = require('../models');

exports.criar = async (req, res) => {
  try {
    const { titulo, descricao } = req.body;
    if (!titulo || !descricao) {
      return res.status(400).json({ erro: 'Título e descrição são obrigatórios' });
    }

    const manifestacao = await Manifestacao.create({
      titulo,
      descricao,
      idUsuario: req.usuario.idUsuario
    });

    return res.status(201).json({ mensagem: 'Manifestação criada', manifestacao });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const manifestacoes = await Manifestacao.findAll({
      include: [
        { model: Usuario, attributes: ['idUsuario', 'nome', 'email'] },
        { model: Resposta, attributes: ['idResposta', 'texto'] }
      ]
    });
    return res.json(manifestacoes);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

exports.buscar = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const manifestacao = await Manifestacao.findByPk(id, {
      include: [
        { model: Usuario, attributes: ['idUsuario', 'nome'] },
        { model: Resposta, attributes: ['idResposta', 'texto'] }
      ]
    });
    if (!manifestacao) {
      return res.status(404).json({ erro: 'Manifestação não encontrada' });
    }

    return res.json(manifestacao);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

exports.editar = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { titulo, descricao, status } = req.body;

    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const manifestacao = await Manifestacao.findByPk(id);
    if (!manifestacao) {
      return res.status(404).json({ erro: 'Manifestação não encontrada' });
    }

    if (manifestacao.idUsuario !== req.usuario.idUsuario && req.usuario.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    const atualizacoes = {};
    if (titulo) atualizacoes.titulo = titulo;
    if (descricao) atualizacoes.descricao = descricao;
    if (status) atualizacoes.status = status;

    await manifestacao.update(atualizacoes);
    return res.json({ mensagem: 'Manifestação atualizada' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

exports.excluir = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido' });
    }

    const manifestacao = await Manifestacao.findByPk(id);
    if (!manifestacao) {
      return res.status(404).json({ erro: 'Manifestação não encontrada' });
    }

    if (manifestacao.idUsuario !== req.usuario.idUsuario && req.usuario.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await manifestacao.destroy();
    return res.json({ mensagem: 'Manifestação excluída' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};
