#!/bin/bash

# Script untuk insert OpenAI API key menggunakan curl
# Pastikan server wa-socket-v2 sudah running di port 4003

echo "🚀 Inserting OpenAI API key..."

if [ -z "$OPENAI_API_KEY" ]; then
  echo "❌ Set environment variable OPENAI_API_KEY first."
  exit 1
fi

API_KEY="$OPENAI_API_KEY"
API_URL="http://localhost:4003/api/api-keys"

echo "📡 API URL: $API_URL"
echo "🔑 API Key: ${API_KEY:0:20}..."

# Insert API key
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"service\": \"openai\",
    \"api_key\": \"$API_KEY\",
    \"is_active\": true
  }"

echo ""
echo "✅ API key insertion completed!"
echo "🧪 Test API key dengan: curl $API_URL/openai"
