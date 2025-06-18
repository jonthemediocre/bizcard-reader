export const openAIConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.OPENAI_MODEL || 'gpt-4',
  timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000'),
  maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '3')
};

// Validate configuration
if (!openAIConfig.apiKey && process.env.NODE_ENV === 'production') {
  throw new Error('OPENAI_API_KEY environment variable is required in production');
} 