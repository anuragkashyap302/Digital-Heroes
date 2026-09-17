import { getStripe } from '../config/stripe.js';
import { ENV } from '../config/env.js';
import { getSupabaseClient, isMockDatabase, mockDataStore } from '../config/db.js';

export class WebhookController {
  static async handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    const stripe = getStripe();

    let event = req.body;

    if (stripe && ENV.STRIPE_WEBHOOK_SECRET) {
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        console.error('Stripe Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    console.log(`Stripe Webhook received: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          const userId = session.client_reference_id || session.metadata?.userId;
          const planType = session.metadata?.planType || 'monthly';
          
          if (session.mode === 'subscription' && userId) {
            await WebhookController.handleSubscriptionCreated(userId, session.subscription, planType, session.customer);
          } else if (session.metadata?.type === 'independent_direct') {
            await WebhookController.handleDirectDonationCompleted(session);
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object;
          await WebhookController.handleSubscriptionStatusChange(subscription);
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object;
          console.log(`Invoice paid for customer ${invoice.customer}`);
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object;
          console.warn(`Invoice payment failed for subscription ${invoice.subscription}`);
          break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return res.json({ received: true });
    } catch (err) {
      console.error('Error handling webhook event:', err);
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  static async handleSubscriptionCreated(userId, stripeSubId, planType, stripeCustomerId) {
    const supabase = getSupabaseClient();
    const periodStart = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 86400000).toISOString();

    if (supabase && !isMockDatabase()) {
      // Mark old subscriptions is_current = false
      await supabase.from('subscriptions').update({ is_current: false }).eq('user_id', userId);
      
      // Insert new subscription
      await supabase.from('subscriptions').insert({
        user_id: userId,
        stripe_subscription_id: stripeSubId,
        stripe_price_id: 'price_live',
        plan_type: planType,
        status: 'active',
        is_current: true,
        current_period_start: periodStart,
        current_period_end: periodEnd
      });

      // Update customer ID on profile
      await supabase.from('profiles').update({ stripe_customer_id: stripeCustomerId }).eq('id', userId);
    } else {
      mockDataStore.subscriptions.forEach(s => {
        if (s.user_id === userId) s.is_current = false;
      });
      mockDataStore.subscriptions.push({
        id: `sub-${Date.now()}`,
        user_id: userId,
        stripe_subscription_id: stripeSubId,
        stripe_price_id: 'price_live',
        plan_type: planType,
        status: 'active',
        is_current: true,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        created_at: new Date().toISOString()
      });
    }
  }

  static async handleSubscriptionStatusChange(stripeSub) {
    const status = stripeSub.status; // 'active', 'past_due', 'canceled', etc.
    const supabase = getSupabaseClient();

    if (supabase && !isMockDatabase()) {
      await supabase
        .from('subscriptions')
        .update({
          status: status === 'active' ? 'active' : (status === 'canceled' ? 'canceled' : 'past_due'),
          cancel_at_period_end: stripeSub.cancel_at_period_end || false,
          canceled_at: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000).toISOString() : null,
          current_period_end: new Date(stripeSub.current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', stripeSub.id);
    } else {
      const sub = mockDataStore.subscriptions.find(s => s.stripe_subscription_id === stripeSub.id);
      if (sub) {
        sub.status = status;
        sub.cancel_at_period_end = stripeSub.cancel_at_period_end || false;
      }
    }
  }

  static async handleDirectDonationCompleted(session) {
    const charityId = session.metadata?.charityId;
    const amount = session.amount_total ? session.amount_total / 100 : 0;
    const donorName = session.metadata?.donorName || session.customer_details?.name;
    const donorEmail = session.metadata?.donorEmail || session.customer_details?.email;

    const supabase = getSupabaseClient();
    if (supabase && !isMockDatabase() && charityId) {
      await supabase.from('donations').insert({
        charity_id: charityId,
        amount,
        source_type: 'independent_direct',
        stripe_payment_intent_id: session.payment_intent,
        donor_name: donorName,
        donor_email: donorEmail
      });
      // Increment charity total_raised
      await supabase.rpc('increment_charity_raised', { p_charity_id: charityId, p_amount: amount });
    }
  }
}
