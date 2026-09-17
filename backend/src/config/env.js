import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, ''),
  SUPABASE_URL: (process.env.SUPABASE_URL || '').replace(/\/+$/, ''),
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  JWT_SECRET: process.env.JWT_SECRET || 'digital-heroes-dev-super-secret-jwt-key-2026',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  STRIPE_MONTHLY_PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_mock',
  STRIPE_YEARLY_PRICE_ID: process.env.STRIPE_YEARLY_PRICE_ID || 'price_yearly_mock',
  STRIPE_YEARLY_DISCOUNTED_PRICE_ID: process.env.STRIPE_YEARLY_DISCOUNTED_PRICE_ID || 'price_yearly_discounted_mock',
  PRIZE_POOL_PERCENTAGE: parseFloat(process.env.PRIZE_POOL_PERCENTAGE || '0.50'),
  MIN_CHARITY_PERCENTAGE: parseFloat(process.env.MIN_CHARITY_PERCENTAGE || '10.00'),
  isDev: (process.env.NODE_ENV || 'development') === 'development'
};
