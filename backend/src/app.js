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

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
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
app.use(errorHandler);

export default app;
