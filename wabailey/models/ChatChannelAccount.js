const { DataTypes } = require('sequelize');
const { db } = require('../config/database');

const ChatChannelAccount = db.define('chat_channel_accounts', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_agent: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chat_channel_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  api_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  api_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  account_name: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  account_username: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  account_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  account_session: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'telegram session'
  },
  wa_browser_id: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  wa_secret_bundle: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  wa_token_1: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  wa_token_2: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  raw_response: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'the whole response'
  },
  send_code_count: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'how many times user click send code button, maximum 3 times'
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '0: inactive, 1: active'
  }
}, {
  tableName: 'chat_channel_accounts',
  timestamps: true,
  indexes: [
    {
      name: 'idx_id_agent',
      fields: ['id_agent']
    },
    {
      name: 'idx_phone_number',
      fields: ['phone_number']
    }
  ]
});

module.exports = ChatChannelAccount;
