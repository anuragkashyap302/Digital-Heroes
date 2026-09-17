import Stripe from 'stripe';
import { ENV } from './env.js';

let stripeInstance = null;

if (ENV.STRIPE_SECRET_KEY && ENV.STRIPE_SECRET_KEY.startsWith('sk_')) {
  try {
    stripeInstance = new Stripe(ENV.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16'
    });
    console.log('Stripe SDK initialized in Live/Test mode.');
  } catch (err) {
    console.warn('Stripe SDK initialization error:', err.message);
  }
} else {
  console.log('No Stripe Secret Key provided in .env - Running with Simulated Stripe Checkout Flow.');
}

export const getStripe = () => stripeInstance;

// Dynamic Price Configuration & Query Service
export const getAvailablePlans = async () => {
  // If live Stripe is connected, fetch dynamic prices
  if (stripeInstance) {
    try {
      const prices = await stripeInstance.prices.list({ active: true, expand: ['data.product'] });
      return prices.data.map(p => ({
        priceId: p.id,
        productId: typeof p.product === 'object' ? p.product.id : p.product,
        name: typeof p.product === 'object' ? p.product.name : 'Subscription Plan',
        amount: p.unit_amount / 100,
        currency: p.currency.toUpperCase(),
        interval: p.recurring ? p.recurring.interval : 'one_time',
        intervalCount: p.recurring ? p.recurring.interval_count : 1
      }));
    } catch (err) {
      console.warn('Could not query live Stripe prices, falling back to configured environment plans:', err.message);
    }
  }

  // Fallback to configurable environment plans
  return [
    {
      priceId: ENV.STRIPE_MONTHLY_PRICE_ID,
      productId: 'prod_monthly',
      name: 'Monthly Hero Subscription',
      planType: 'monthly',
      amount: 29.00,
      currency: 'GBP',
      interval: 'month',
      description: 'Monthly prize draw entry, handicap tracking, and 10%+ charity contribution.',
      badge: 'Flexible'
    },
    {
      priceId: ENV.STRIPE_YEARLY_PRICE_ID,
      productId: 'prod_yearly',
      name: 'Annual Champion Subscription',
      planType: 'yearly',
      amount: 290.00,
      currency: 'GBP',
      interval: 'year',
      description: '12 months of draw eligibility, charity impact reporting, and priority scorecard verification.',
      badge: 'Standard'
    },
    {
      priceId: ENV.STRIPE_YEARLY_DISCOUNTED_PRICE_ID,
      productId: 'prod_yearly_discount',
      name: 'Discounted Founder Annual Plan',
      planType: 'yearly_discounted',
      amount: 249.00,
      currency: 'GBP',
      interval: 'year',
      description: 'Special discounted annual rate. Maximum prize pool leverage and charity allocation.',
      badge: 'Best Value (15% Off)'
    }
  ];
};
