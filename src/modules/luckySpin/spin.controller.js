const spinService = require("./spin.services");

const handleSpin = async (req, res) => {
  try {
    // req.user.id comes from your auth middleware
    const userId = req.user.id;

    const result = await spinService.executeSpin(userId);

    res.status(200).json({
      success: true,
      message:
        result.amountWon > 0
          ? `Congratulations! You won Rs. ${result.amountWon}`
          : "Better luck next time!",
      data: result,
    });
  } catch (error) {
    // If user has 0 spins, the service throws an error which we catch here
    res.status(400).json({
      success: false,
      message: error.message || "Something went wrong during the spin",
    });
  }
};

module.exports = {
  handleSpin,
};
