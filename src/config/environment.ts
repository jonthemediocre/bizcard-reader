export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  apiUrl: string;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  openaiApiKey?: string;
  stripePublishableKey?: string;
  auth0Domain?: string;
  auth0ClientId?: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvironmentConfig['nodeEnv'];
  
  return {
    nodeEnv,
    apiUrl: process.env.VITE_API_URL || 'http://localhost:3001',
    enableLogging: nodeEnv === 'development' || nodeEnv === 'test',
    logLevel: (process.env.VITE_LOG_LEVEL as EnvironmentConfig['logLevel']) || 'info',
    openaiApiKey: process.env.VITE_OPENAI_API_KEY,
    stripePublishableKey: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    auth0Domain: process.env.VITE_AUTH0_DOMAIN,
    auth0ClientId: process.env.VITE_AUTH0_CLIENT_ID,
  };
};

export const env = getEnvironmentConfig();

// Production safety check
if (env.nodeEnv === 'production' && env.enableLogging) {
  console.warn('⚠️ Logging is enabled in production. Consider disabling for performance.');
}

export default env; 