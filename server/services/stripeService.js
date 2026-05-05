// Stripe Service — wraps all Stripe API calls so the controller never imports Stripe directly.
// Use test-mode keys only; never expose STRIPE_SECRET_KEY to the client.
import Stripe from 'stripe';

let _stripe;

function getStripe() {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
}

/**
 * Create a PaymentIntent.
 * @param {number} amount - Amount in major currency units (e.g. dollars). Converted to cents internally.
 * @param {string} currency - ISO currency code, defaults to 'usd'.
 * @param {object} metadata - Arbitrary key-value pairs attached to the intent.
 * @returns {Stripe.PaymentIntent}
 */
export async function createPaymentIntent(amount, currency = 'usd', metadata = {}) {
  return getStripe().paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency,
    metadata
  });
}

/**
 * Retrieve a PaymentIntent by ID.
 * @param {string} paymentIntentId
 * @returns {Stripe.PaymentIntent}
 */
export async function retrievePaymentIntent(paymentIntentId) {
  return getStripe().paymentIntents.retrieve(paymentIntentId);
}

/**
 * Cancel a PaymentIntent.
 * @param {string} paymentIntentId
 * @returns {Stripe.PaymentIntent}
 */
export async function cancelPaymentIntent(paymentIntentId) {
  return getStripe().paymentIntents.cancel(paymentIntentId);
}
