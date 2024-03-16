const Stripe = require("stripe");
require("dotenv").config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: false,
  apiVersion: "2023-10-16",
});

async function createPaymentIntent(amount) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "EUR",
    });

    return { client_secret : paymentIntent.client_secret, error: null, status: 200};
  } catch (error) {
    return { client_secret : null, error: error, status: 200}
  }
}

module.exports = { createPaymentIntent }