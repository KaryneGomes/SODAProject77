module.exports = (...permissoes) => {
  return (req, res, next) => {
    const tipo = req.usuario?.tipo;
    if (!tipo) {
      return res.status(403).json({ erro: 'Não autorizado' });
    }
    if (permissoes.length > 0 && !permissoes.includes(tipo)) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    return next();
  };
};
