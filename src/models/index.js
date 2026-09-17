const Usuario = require('./Usuario');
const Manifestacao = require('./Manifestacao');
const Resposta = require('./Resposta');

Usuario.hasMany(Manifestacao, { foreignKey: 'idUsuario', onDelete: 'CASCADE' });
Manifestacao.belongsTo(Usuario, { foreignKey: 'idUsuario' });

Manifestacao.hasMany(Resposta, { foreignKey: 'idManifestacao', onDelete: 'CASCADE' });
Resposta.belongsTo(Manifestacao, { foreignKey: 'idManifestacao' });

Usuario.hasMany(Resposta, { foreignKey: 'idUsuario', onDelete: 'SET NULL' });
Resposta.belongsTo(Usuario, { foreignKey: 'idUsuario' });

module.exports = { Usuario, Manifestacao, Resposta };
