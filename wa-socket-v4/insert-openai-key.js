#!/usr/bin/env node

/**
 * Script untuk insert OpenAI API key ke database
 * Usage: node insert-openai-key.js
 */

require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4003';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ Set OPENAI_API_KEY in .env or the environment before running this script.');
  process.exit(1);
}

async function insertOpenAIKey() {
  try {
    console.log('🚀 Inserting OpenAI API key...');
    console.log(`📡 API Base URL: ${API_BASE_URL}`);
    console.log(`🔑 API Key: ${OPENAI_API_KEY.substring(0, 20)}...`);

    const response = await axios.post(`${API_BASE_URL}/api/api-keys`, {
      service: 'openai',
      api_key: OPENAI_API_KEY,
      is_active: true
    });

    if (response.data.success) {
      console.log('✅ OpenAI API key inserted successfully!');
      console.log('📋 Response:', response.data.message);
    } else {
      console.error('❌ Failed to insert API key:', response.data.message);
    }

  } catch (error) {
    console.error('❌ Error inserting API key:', error.message);

    if (error.response) {
      console.error('📋 Response data:', error.response.data);
      console.error('📋 Status:', error.response.status);
    }
  }
}

// Run the script
insertOpenAIKey();
