const { Resposta, Manifestacao, Usuario } = require('../models');
const { podeResponderManifestacao } = require('../utils/permissoesOuvidoria');

exports.criarResposta = async (req, res) => {
  try {
    const { texto, idManifestacao } = req.body;
    if (!texto || !idManifestacao) {
      return res.status(400).json({ erro: 'Texto e ID da manifestação são obrigatórios' });
    }

    const manifestacao = await Manifestacao.findByPk(idManifestacao);
    if (!manifestacao) {
      return res.status(404).json({ erro: 'Manifestação não encontrada' });
    }

    if (manifestacao.status === 'concluida') {
      return res.status(400).json({ erro: 'Não é possível responder a uma manifestação concluída' });
    }

    const autorManifestacao = await Usuario.findByPk(manifestacao.idUsuario, {
      attributes: ['idUsuario', 'tipoUsuario', 'nome']
    });

    if (!autorManifestacao) {
      return res.status(404).json({ erro: 'Autor da manifestação não encontrado' });
    }

    const usuarioLogado = await Usuario.findByPk(req.usuario.idUsuario, {
      attributes: ['idUsuario', 'tipoUsuario']
    });

    if (!usuarioLogado) {
      return res.status(401).json({ erro: 'Usuário não encontrado' });
    }

    if (!podeResponderManifestacao(usuarioLogado, autorManifestacao)) {
      return res.status(403).json({
        erro: 'Você não tem permissão para responder a esta manifestação com base no cargo e no setor responsável.'
      });
    }

    const resposta = await Resposta.create({
      texto,
      idManifestacao,
      idUsuario: req.usuario.idUsuario
    });

    return res.status(201).json({ mensagem: 'Resposta criada', resposta });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const respostas = await Resposta.findAll({
      include: [
        { model: Manifestacao, attributes: ['idManifestacao', 'titulo'] },
        { model: Usuario, attributes: ['idUsuario', 'nome'] }
      ]
    });

    return res.json(respostas);
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

    const resposta = await Resposta.findByPk(id, {
      include: [
        { model: Manifestacao, attributes: ['idManifestacao', 'titulo'] },
        { model: Usuario, attributes: ['idUsuario', 'nome'] }
      ]
    });

    if (!resposta) {
      return res.status(404).json({ erro: 'Resposta não encontrada' });
    }

    return res.json(resposta);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};

exports.editar = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { texto } = req.body;

    if (!id || !texto) {
      return res.status(400).json({ erro: 'ID e texto são obrigatórios' });
    }

    const resposta = await Resposta.findByPk(id);
    if (!resposta) {
      return res.status(404).json({ erro: 'Resposta não encontrada' });
    }

    if (resposta.idUsuario !== req.usuario.idUsuario && req.usuario.tipo !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await resposta.update({ texto });
    return res.json({ mensagem: 'Resposta atualizada' });
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

    const resposta = await Resposta.findByPk(id);
    if (!resposta) {
      return res.status(404).json({ erro: 'Resposta não encontrada' });
    }

    await resposta.destroy();
    return res.json({ mensagem: 'Resposta excluída' });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
};
