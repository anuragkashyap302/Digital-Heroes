import express from 'express';
import { SubscriptionController } from '../controllers/subscriptionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public plan pricing
router.get('/plans', SubscriptionController.getPlans);

// Protected subscriber subscription management
router.get('/current', authenticate, SubscriptionController.getCurrentSubscription);
router.post('/checkout-session', authenticate, SubscriptionController.createCheckoutSession);
router.post('/portal', authenticate, SubscriptionController.createCustomerPortal);
router.post('/cancel', authenticate, SubscriptionController.cancelSubscription);

export default router;
