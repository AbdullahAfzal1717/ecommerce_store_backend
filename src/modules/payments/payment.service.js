const Stripe = require("stripe");
let stripe;

const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripe;
};

const createIntent = async (amount) => {
  // Stripe expects amount in cents/lowest denomination
  return await getStripe().paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "hkd", // Since your account is HK based
    automatic_payment_methods: { enabled: true },
  });
};

module.exports = { createIntent };
