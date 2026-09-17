const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Manifestacao = db.define('Manifestacao', {
  idManifestacao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  titulo: { type: DataTypes.STRING, allowNull: false },
  descricao: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('aberta', 'em andamento', 'concluida'), allowNull: false, defaultValue: 'aberta' }
}, {
  tableName: 'manifestacoes',
  timestamps: true
});

module.exports = Manifestacao;
