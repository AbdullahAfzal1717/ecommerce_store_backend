const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createIntent = async (amount) => {
  // Stripe expects amount in cents/lowest denomination
  return await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "hkd", // Since your account is HK based
    automatic_payment_methods: { enabled: true },
  });
};

module.exports = { createIntent };
