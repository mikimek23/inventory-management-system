import express from "express";
import cors from "cors";
import errorHandler from "./middleware/error.middleware.js";
import userRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http:localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "healthy" });
});
app.use("/api/auth", userRouter);
app.use(errorHandler);
export default app;
