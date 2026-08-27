import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const env = {
  PORT: parseInt(process.env.PORT || "4000", 10),
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || "",
};

if (!env.DEEPGRAM_API_KEY) {
  console.warn("WARNING: DEEPGRAM_API_KEY environment variable is not set!");
}
