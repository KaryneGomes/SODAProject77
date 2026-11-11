const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Resposta = db.define('Resposta', {
  idResposta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  texto: { type: DataTypes.TEXT, allowNull: false }
}, {
  tableName: 'respostas',
  timestamps: true
});

module.exports = Resposta;
