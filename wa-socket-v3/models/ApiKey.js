const { DataTypes } = require('sequelize');
const { db } = require('../config/database');

const ApiKey = db.define('ApiKey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'Service name (e.g., openai, anthropic)'
  },
  api_key: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'API key'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Whether this API key is active'
  }
}, {
  tableName: 'api_keys',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ApiKey;
