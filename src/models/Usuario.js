const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Usuario = db.define('Usuario', {
  idUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },

  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },

  tipoUsuario: {
    type: DataTypes.ENUM(
      'aluno',
      'professor',
      'servidor',
      'coordenador',
      'admin'
    ),
    allowNull: false,
    defaultValue: 'aluno'
  },

  matricula: {
    type: DataTypes.STRING,
    allowNull: true
  },

  curso: {
    type: DataTypes.STRING,
    allowNull: true
  },

  periodo: {
    type: DataTypes.STRING,
    allowNull: true
  },

  disciplina: {
    type: DataTypes.STRING,
    allowNull: true
  },

  siape: {
    type: DataTypes.STRING,
    allowNull: true
  },

  cargo: {
    type: DataTypes.STRING,
    allowNull: true
  }

}, {
  tableName: 'usuarios',
  timestamps: true
});

module.exports = Usuario;