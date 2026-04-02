require('dotenv').config();
const { db, testConnection } = require('../config/database');
const ApiKey = require('../models/ApiKey');

async function insertApiKey() {
  try {
    console.log('🔗 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful');

    // Sync database
    await db.sync();
    console.log('✅ Database models synchronized');

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error('❌ Set OPENAI_API_KEY in .env or the environment.');
      process.exit(1);
    }

    // Insert OpenAI API key
    const apiKeyData = {
      service: 'openai',
      api_key: openaiKey,
      is_active: true
    };

    // Check if API key already exists
    const existingKey = await ApiKey.findOne({
      where: { service: 'openai' }
    });

    if (existingKey) {
      console.log('🔄 Updating existing OpenAI API key...');
      await existingKey.update(apiKeyData);
      console.log('✅ OpenAI API key updated successfully');
    } else {
      console.log('➕ Creating new OpenAI API key...');
      await ApiKey.create(apiKeyData);
      console.log('✅ OpenAI API key created successfully');
    }

    // Verify the API key was saved
    const savedKey = await ApiKey.findOne({
      where: { service: 'openai' }
    });

    if (savedKey) {
      console.log('✅ API key verification successful');
      console.log(`📋 Service: ${savedKey.service}`);
      console.log(`🔑 API Key: ${savedKey.api_key.substring(0, 20)}...`);
      console.log(`🟢 Active: ${savedKey.is_active}`);
    } else {
      console.error('❌ API key verification failed');
    }

    console.log('🎉 API key setup completed!');

  } catch (error) {
    console.error('❌ Error inserting API key:', error);
    console.error('❌ Error details:', error.message);
  } finally {
    await db.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
console.log('🚀 Starting API key insertion...');
insertApiKey();
