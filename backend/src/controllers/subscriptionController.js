import { getAvailablePlans, getStripe } from '../config/stripe.js';
import { ENV } from '../config/env.js';
import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';

export class SubscriptionController {
  static async getPlans(req, res, next) {
    try {
      const plans = await getAvailablePlans();
      return res.json({
        success: true,
        plans
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCheckoutSession(req, res, next) {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      const { priceId, planType = 'monthly' } = req.body;

      const stripe = getStripe();

      if (stripe && priceId && !priceId.includes('mock')) {
        try {
          const lineItem = priceId.startsWith('price_')
            ? { price: priceId, quantity: 1 }
            : {
                price_data: {
                  currency: 'gbp',
                  product: priceId.startsWith('prod_') ? priceId : undefined,
                  product_data: !priceId.startsWith('prod_') ? { name: `Digital Heroes ${planType.replace('_', ' ')} Plan` } : undefined,
                  recurring: { interval: planType.includes('yearly') ? 'year' : 'month' },
                  unit_amount: planType === 'yearly_discounted' ? 24900 : (planType === 'yearly' ? 29000 : 2900)
                },
                quantity: 1
              };

          const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: userEmail,
            client_reference_id: userId,
            metadata: { userId, planType },
            line_items: [lineItem],
            success_url: `${ENV.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${ENV.CLIENT_URL}/pricing?canceled=true`
          });

          return res.json({
            success: true,
            url: session.url,
            sessionId: session.id
          });
        } catch (stripeErr) {
          console.warn('⚠️ Live Stripe checkout session creation failed, falling back to simulated checkout:', stripeErr.message);
        }
      }

      // Simulated Checkout Flow for Local Development
      const simulatedSubId = `sub_stripe_${Date.now()}`;
      const periodMonths = planType.includes('yearly') ? 12 : 1;
      const currentPeriodStart = new Date().toISOString();
      const currentPeriodEnd = new Date(Date.now() + periodMonths * 30 * 86400000).toISOString();

      const existingSubIndex = mockDataStore.subscriptions.findIndex(s => s.user_id === userId && s.is_current);
      if (existingSubIndex > -1) {
        mockDataStore.subscriptions[existingSubIndex].is_current = false;
      }

      const newSub = {
        id: `sub-${Date.now()}`,
        user_id: userId,
        stripe_subscription_id: simulatedSubId,
        stripe_price_id: priceId || 'price_simulated',
        plan_type: planType,
        status: 'active',
        is_current: true,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: false,
        canceled_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockDataStore.subscriptions.push(newSub);

      return res.json({
        success: true,
        url: `${ENV.CLIENT_URL}/dashboard?simulation=active_subscribed`,
        simulated: true,
        subscription: newSub
      });
    } catch (error) {
      next(error);
    }
  }

  static async createCustomerPortal(req, res, next) {
    try {
      const user = req.user;
      const stripe = getStripe();

      if (stripe && user.stripe_customer_id) {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: user.stripe_customer_id,
          return_url: `${ENV.CLIENT_URL}/dashboard`
        });

        return res.json({ success: true, url: portalSession.url });
      }

      return res.json({
        success: true,
        url: `${ENV.CLIENT_URL}/dashboard/billing?notice=portal_simulated`,
        simulated: true
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCurrentSubscription(req, res, next) {
    try {
      const userId = req.user.id;
      const supabase = getSupabaseClient();

      if (supabase && !isMockDatabase()) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('is_current', true)
          .maybeSingle();

        if (error) throw error;
        return res.json({ success: true, subscription: data || null });
      }

      const sub = mockDataStore.subscriptions.find(s => s.user_id === userId && s.is_current);
      return res.json({ success: true, subscription: sub || null });
    } catch (error) {
      next(error);
    }
  }

  static async cancelSubscription(req, res, next) {
    try {
      const userId = req.user.id;
      const sub = mockDataStore.subscriptions.find(s => s.user_id === userId && s.is_current);

      if (!sub) {
        return res.status(404).json({ success: false, message: 'No active subscription found to cancel.' });
      }

      sub.cancel_at_period_end = true;
      sub.canceled_at = new Date().toISOString();
      sub.updated_at = new Date().toISOString();

      return res.json({
        success: true,
        message: 'Subscription scheduled for cancellation at the end of the current billing cycle.',
        subscription: sub
      });
    } catch (error) {
      next(error);
    }
  }
}
