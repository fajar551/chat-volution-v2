// Database configuration for React app
// This is a simplified version for client-side usage

const databaseConfig = {
  // Database connection will be handled by the backend API
  // This file is just for reference and potential future use
  apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:4003',

  // API endpoints
  endpoints: {
    apiKeys: '/api-keys',
    messages: '/messages',
    whatsapp: '/whatsapp'
  }
};

export default databaseConfig;
