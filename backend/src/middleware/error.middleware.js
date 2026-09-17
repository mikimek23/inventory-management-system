import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client.ts";

const errorHandler = (err, req, res, next) => {
  console.log(err);
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // Unique constraint violation
      case "P2002":
        return res.status(409).json({
          success: false,
          message: "A record with this value already exists",
        });

      // Record not found
      case "P2025":
        return res.status(404).json({
          success: false,
          message: "The requested record was not found",
        });

      default:
        return res.status(500).json({
          success: false,
          message: "A database error occurred",
        });
    }
  }
  const statusCode = err.statusCode || 500;
  res
    .status(statusCode)
    .json({ success: false, message: err.message || "Internal server error" });
};
export default errorHandler;
