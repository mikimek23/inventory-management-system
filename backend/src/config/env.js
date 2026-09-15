import "dotenv/config";
export const getEnv = () => {
  const nodeEnv = process.env.NODE_ENV || "development";
  const corsOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  return {
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv,
    port: process.env.PORT || 5000,
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || "",
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "",
    accessTokenExpiredIn: process.env.JWT_ACCESS_EXPIRES_IN,
    refreshTokenExpiredIn: process.env.JWT_REFRESH_EXPIRES_IN,
  };
};
export const validateEnv = () => {
  const env = getEnv();
  const missing = [];

  if (!env.databaseUrl) missing.push("DATABASE_URL");
  if (!env.accessTokenSecret) missing.push("JWT_ACCESS_SECRET");
  if (!env.refreshTokenSecret) missing.push("JWT_REFRESH_SECRET");
  if (!env.accessTokenExpiredIn) missing.push("JWT_ACCESS_EXPIRES_IN");
  if (!env.refreshTokenExpiredIn) missing.push("JWT_REFRESH_EXPIRES_IN");

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
};
