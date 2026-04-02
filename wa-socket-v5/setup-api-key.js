/**
 * Script sederhana untuk setup OpenAI API key
 * Jalankan: node setup-api-key.js
 */

require('dotenv').config();
const { db, testConnection } = require('./config/database');
const ApiKey = require('./models/ApiKey');

async function setupApiKey() {
  try {
    console.log('🔗 Connecting to database...');
    await testConnection();

    console.log('🔄 Syncing database...');
    await db.sync();

    console.log('🔑 Inserting OpenAI API key...');

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error('❌ Set OPENAI_API_KEY in .env or the environment.');
      process.exit(1);
    }

    const result = await ApiKey.upsert({
      service: 'openai',
      api_key: openaiKey,
      is_active: true
    });

    console.log('✅ OpenAI API key setup completed!');
    console.log('📋 Result:', result ? 'Created/Updated' : 'Failed');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await db.close();
    process.exit(0);
  }
}

setupApiKey();
