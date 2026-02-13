const NODE_ENV = process.env.NODE_ENV || "development";
if (NODE_ENV === "development") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const errorHandler = require("./middlewares/error.middleware");
const orderRoutes = require("./modules/orders/orders.routes");

// mod“For every incoming request (or specific routes), run this function before going to the route handler.”ules
const authRouter = require("./modules/auth");
const categoryRouter = require("./modules/categories");
const subcategoryRouter = require("./modules/subcategories");
const productRouter = require("./modules/products");
const paymentRouter = require("./modules/payments");
const settingRouter = require("./modules/settings/settings.routes");
const spinRouter = require("./modules/luckySpin/spin.routes");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json()); //
// Rate limiter (example)
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// Static uploads (if present)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API (versioned)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/subcategories", subcategoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/settings", settingRouter);
app.use("/api/v1/spins", spinRouter);

app.get("/api/health", (_, res) =>
  res.json({ status: "OK", message: "Server running" })
);

// 404 handler (catch-all)
app.use("*", (_, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

// Error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
