const { DataTypes } = require('sequelize');
const { db } = require('../config/database');

const WhatsAppMessage = db.define('whatsapp_messages', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  message_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  from_number: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  to_number: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  media_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Media attachment data'
  },
  message_type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'document', 'sticker'),
    defaultValue: 'text'
  },
  direction: {
    type: DataTypes.ENUM('incoming', 'outgoing'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  received_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  agent_id: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Agent who sent the message'
  },
  chat_session_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Chat session identifier'
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read', 'failed'),
    defaultValue: 'sent'
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the message has been read'
  },
  chat_status: {
    type: DataTypes.ENUM('open', 'closed'),
    defaultValue: 'open',
    comment: 'Chat status: open or closed'
  },
  is_pending: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the chat is pending (true) or not (false)'
  },
  assigned_to: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Agent ID who is assigned to handle this chat'
  },
  instance: {
    type: DataTypes.STRING(10),
    allowNull: true,
    defaultValue: 'wa1',
    comment: 'WhatsApp instance identifier (wa1, wa2, etc.)'
  }
}, {
  tableName: 'whatsapp_messages',
  timestamps: true,
  indexes: [
    {
      name: 'idx_from_number',
      fields: ['from_number']
    },
    {
      name: 'idx_timestamp',
      fields: ['timestamp']
    },
    {
      name: 'idx_instance',
      fields: ['instance']
    }
  ]
});

module.exports = WhatsAppMessage;
