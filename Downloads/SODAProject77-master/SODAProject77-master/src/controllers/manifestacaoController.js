const { Manifestacao, Usuario, Resposta } = require('../models');
const crypto = require('node:crypto');

function prepararFotoPerfil(usuario) {
  if (!usuario) return;

  usuario.temFoto = Boolean(usuario.fotoPerfil);
  usuario.fotoVersao = usuario.fotoPerfil
    ? crypto.createHash('sha256').update(usuario.fotoPerfil).digest('hex')
    : '';
  delete usuario.fotoPerfil;
}

function prepararFotosManifestacao(dados) {
  prepararFotoPerfil(dados.Usuario || dados.usuario);
  const respostas = dados.Resposta || dados.Respostas || dados.respostas || [];
  for (const resposta of Array.isArray(respostas) ? respostas : [respostas]) {
    prepararFotoPerfil(resposta?.Usuario || resposta?.usuario);
  }
  return dados;
}

exports.criar = async (req, res) => {
  try {
    const { titulo, descricao, imagem } = req.body;
    if (!titulo || !descricao) {
      return res.status(400).json({ erro: 'Título e descrição são obrigatórios' });
    }

    if (imagem) {
      const imagemValida = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/i.test(imagem);
      if (!imagemValida) {
        return res.status(400).json({ erro: 'A imagem precisa estar em JPEG, PNG ou WebP.' });
      }
      if (imagem.length > 7 * 1024 * 1024) {
        return res.status(413).json({ erro: 'A imagem deve ter até aproximadamente 5 MB.' });
      }
    }

    const manifestacao = await Manifestacao.create({
      titulo,
      descricao,
      imagem: imagem || null,
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
        { model: Usuario, attributes: ['idUsuario', 'nome', 'fotoPerfil'] },
        {
          model: Resposta,
          attributes: ['idResposta', 'texto', 'createdAt'],
          include: [{ model: Usuario, attributes: ['idUsuario', 'nome', 'tipoUsuario', 'fotoPerfil'] }]
        }
      ]
    });
    const resultado = manifestacoes.map((manifestacao) => prepararFotosManifestacao(manifestacao.toJSON()));
    return res.json(resultado);
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
        { model: Usuario, attributes: ['idUsuario', 'nome', 'fotoPerfil'] },
        {
          model: Resposta,
          attributes: ['idResposta', 'texto', 'createdAt'],
          include: [{ model: Usuario, attributes: ['idUsuario', 'nome', 'tipoUsuario', 'fotoPerfil'] }]
        }
      ]
    });
    if (!manifestacao) {
      return res.status(404).json({ erro: 'Manifestação não encontrada' });
    }

    return res.json(prepararFotosManifestacao(manifestacao.toJSON()));
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
