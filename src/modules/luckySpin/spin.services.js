const User = require("../../models/user.model");
const Settings = require("../../models/setting.model");

const executeSpin = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.availableSpins < 1) {
    throw new Error("No spins available!");
  }

  // 1. Get Win Mode from Settings
  const config = await Settings.findOne({ key: "global_config" });
  const isWinMode = config ? config.winModeEnabled : false;

  // 2. Define Prizes and Probabilities
  const prizes = [
    { label: "Rs. 5", value: 5, weight: 40 },
    { label: "Rs. 20", value: 20, weight: 30 },
    { label: "Better Luck", value: 0, weight: 20 },
    { label: "Rs. 50", value: 50, weight: 9 },
    { label: "Rs. 500", value: 500, weight: 1 }, // Only 1% normally
  ];

  // 3. Adjust Weight if Win Mode is ON
  if (isWinMode) {
    prizes[4].weight = 25; // Boost Jackpot to 25%
    prizes[2].weight = 5; // Reduce "Better Luck" to 5%
  }

  // 4. Random Selector Logic
  const totalWeight = prizes.reduce((acc, p) => acc + p.weight, 0);
  let random = Math.floor(Math.random() * totalWeight);

  let selectedPrize = prizes[0];
  for (const prize of prizes) {
    if (random < prize.weight) {
      selectedPrize = prize;
      break;
    }
    random -= prize.weight;
  }

  // 5. Update User Database
  user.availableSpins -= 1;
  user.walletBalance += selectedPrize.value;
  await user.save();

  return {
    prize: selectedPrize.label,
    amountWon: selectedPrize.value,
    remainingSpins: user.availableSpins,
    newBalance: user.walletBalance,
  };
};

module.exports = { executeSpin };
