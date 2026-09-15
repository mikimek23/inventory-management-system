import app from "./src/app.js";
import dotenv from "dotenv";
import path from 'node:path'
import { getEnv, validateEnv } from "./src/config/env.js";
dotenv.config({path:path.resolve(process.cwd(),'.env')});
validateEnv()
const env = getEnv()
app.listen(env.port, () => {
  console.log(`server is running on http://localhost:${env.port}`);
});
