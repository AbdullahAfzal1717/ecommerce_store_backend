const paymentService = require("./payment.service");

const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await paymentService.createIntent(amount);

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPaymentIntent };
