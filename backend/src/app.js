import "dotenv/config";
import express from "express";
import cors from "cors";
import errorHandler from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import profileRouter from "./routes/profile.routes.js";
import categoryRouter from "./routes/category.routes.js";
import productRouter from "./routes/product.routes.js";
import customerRouter from "./routes/customer.routes.js";
import supplierRouter from "./routes/supplier.routes.js";
import purchaseRouter from "./routes/purchaseRoutes.js";
import saleRouter from "./routes/sale.routes.js";
import stockRouter, { stockAdjustmentRouter } from "./routes/stock.routes.js";
import docRouter from "./routes/doc.routes.js";

const app = express();

const getAllowedOrigins = () => {
  const envOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((o) => o.trim().replace(/\/+$/, ""))
    : [];
  return [
    ...envOrigins,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
  ];
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/+$/, "");
      const allowed = getAllowedOrigins();
      // If matches allowed list or in development
      if (
        allowed.includes(cleanOrigin) ||
        process.env.NODE_ENV !== "production" ||
        !process.env.FRONTEND_URL
      ) {
        return callback(null, true);
      }
      // Fallback: reflect valid origin so cross-origin requests don't hard crash
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "healthy" });
});
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/profile", profileRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/customers", customerRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/purchases", purchaseRouter);
app.use("/api/sales", saleRouter);
app.use("/api/stock", stockRouter);
app.use("/api/stock-adjustments", stockAdjustmentRouter);
app.use("/api/doc", docRouter);
app.use("/api/docs", (req, res) => res.redirect("/api/doc"));
app.use(errorHandler);

export default app;
